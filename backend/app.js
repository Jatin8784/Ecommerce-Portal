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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
config({ path: "./config/config.env" });

app.use(cookieParser());

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.log("Webhook Error:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentId = event.data.object.id;

      try {
        await database.query("BEGIN");

        const paymentUpdate = await database.query(
          "UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING order_id",
          ["Paid", paymentIntentId],
        );

        if (paymentUpdate.rows.length === 0) {
          throw new Error("Payment record not found");
        }

        const orderId = paymentUpdate.rows[0].order_id;

        await database.query(
          "UPDATE orders SET paid_at = NOW() WHERE id = $1",
          [orderId],
        );

        const { rows: items } = await database.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
          [orderId],
        );

        for (const item of items) {
          await database.query(
            "UPDATE products SET stock = stock - $1 WHERE id = $2",
            [item.quantity, item.product_id],
          );
        }

        await database.query("COMMIT");
      } catch (error) {
        await database.query("ROLLBACK");
        return res.status(500).send("Database Update Failed");
      }
    }
    res.status(200).send({ received: true });
  },
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send({ activeStatus: true, error: false });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

createTables();
app.use(errorMiddleware);

export default app;
