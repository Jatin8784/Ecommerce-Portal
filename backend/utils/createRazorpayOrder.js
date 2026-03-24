import Razorpay from "razorpay";
import database from "../database/db.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

export async function createRazorpayOrder(orderId, totalPrice) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const options = {
      amount: totalPrice * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES($1, $2, $3, $4) ON CONFLICT (order_id) DO UPDATE SET payment_intent_id = $4, payment_status = $3",
      [orderId, "Online", "Pending", razorpayOrder.id],
    );

    return { success: true, razorpayOrder };
  } catch (error) {
    console.error("Razorpay Order Error:", error.message || error);
    return { success: false, message: error.message || "Failed to create Razorpay order." };
  }
}
