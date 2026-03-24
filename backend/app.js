import express from "express";
import crypto from "crypto";
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

app.post("/api/v1/payment/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    try {
      await database.query("BEGIN");

      await database.query(
        "UPDATE payments SET payment_status = $1, payment_intent_id = $2 WHERE order_id = $3",
        ["Paid", razorpay_payment_id, orderId],
      );

      await database.query("UPDATE orders SET paid_at = NOW() WHERE id = $1", [
        orderId,
      ]);

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
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      await database.query("ROLLBACK");
      return res.status(500).json({ success: false, message: "Verification failed on server" });
    }
  } else {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

createTables();
app.use(errorMiddleware);

export default app;
