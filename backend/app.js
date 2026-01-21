import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import createTables from "./utils/createTables.js";
import database from "./database/db.js";
import { errorMiddleware } from "./middleware/errorMiddlewares.js";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import orderRouter from "./router/orderRoutes.js";
import Stripe from "stripe";

const app = express();

config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    credentials: true,
  }),
);

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = Stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      return res.status(400).send(`Webhook Error ${error.message || error}`);
    }

    // Handling the event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent_client_secret = event.data.object.client_secret;
      try {
        // Finding And Updated Payment
        const updatedPaymentStatus = "Paid";
        const paymentTableUpdateResult = await database.query(
          "UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *",
          [updatedPaymentStatus, paymentIntent_client_secret],
        );
        const orderTableUpdateResult = await database.query(
          "UPDATE orders SET paid_at = NOW() WHERE id = $1 RETURNING *",
          [paymentTableUpdateResult.rows[0].order_id],
        );

        // Reduce Stock for each Product
        const orderId = paymentTableUpdateResult.rows[0].order_id;

        const { rows: orderedItems } = await database.query(
          `
              SELECT product_id, quantity FROM order_items WHERE order_id = $1
          `,
          [orderId],
        );

        // For each ordered items, reduce the product stock
        for (const item of orderedItems) {
          await database.query(
            "UPDATE products SET stock = stock - $1 WHERE id = $2",
            [item.quantity, item.product_id],
          );
        }
      } catch (error) {
        return res
          .status(500)
          .send(`Error updating paid_at timestamp in order table.`);
      }
    }
    res.status(200).send({ received: true });
  },
);

app.get("/", (req, res) => {
  activeStatus: true;
  error: false;
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

createTables();

app.use(errorMiddleware);

export default app;
