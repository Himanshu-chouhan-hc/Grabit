const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../module/order");
const verifyToken = require("../middleware/verify");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// =====================
// CREATE ORDER
// =====================
router.post("/api/create-order", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    res.json({ success: true, order });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =====================
// VERIFY PAYMENT + SAVE ORDER
// =====================
router.post("/api/verify-payment", verifyToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    if (razorpay_order_id !== "COD") {

      const body = razorpay_order_id + "|" + razorpay_payment_id;

      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expected !== razorpay_signature) {
        return res.json({ success: false, message: "Invalid payment" });
      }
    }

    const order = await Order.create({
      userId: req.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      discount: orderData.discount,
      deliveryFee: orderData.deliveryFee,
      finalAmount: orderData.finalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: "Completed",
      paymentVerified: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id
    });

    res.json({ success: true, order });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// =====================
// GET ORDERS
// =====================
router.get("/api/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;