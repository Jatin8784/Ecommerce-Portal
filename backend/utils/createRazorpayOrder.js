import Razorpay from "razorpay";
import database from "../database/db.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

export async function createRazorpayOrder(orderId, totalPrice) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Missing Razorpay Keys in Environment!");
    return {
      success: false,
      message: "Missing Razorpay Keys. Check Render Dashboard.",
    };
  }

  const dollor_inr = 94.07;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
  });

  try {
    const options = {
      amount: totalPrice * dollor_inr, // Amount in paise
      currency: "INR",
      receipt: `${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await database.query(
      "INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES($1, $2, $3, $4) ON CONFLICT (order_id) DO UPDATE SET payment_intent_id = $4, payment_status = $3",
      [orderId, "Online", "Pending", razorpayOrder.id],
    );

    return { success: true, razorpayOrder };
  } catch (error) {
    console.error("Razorpay Order Error Full:", JSON.stringify(error, null, 2));
    const errorMsg = error.error
      ? error.error.description
      : error.message || "Unknown Razorpay error";
    return { success: false, message: errorMsg };
  }
}
