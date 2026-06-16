const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../module/order");
const verifyToken = require("../middleware/verify");

function generateOrderNumber() {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `ORD-${timestamp}-${randomSuffix}`;
}

require("dotenv").config();

// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ===================== CREATE ORDER =====================
router.post("/api/create-order", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    console.log("Create Order Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// ===================== VERIFY PAYMENT =====================
router.post("/api/verify-payment", verifyToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // COD ORDER
    if (razorpay_order_id === "COD") {
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        userId: req.userId,
        items: orderData.items,
        totalAmount: orderData.total,
        discount: orderData.discount,
        deliveryFee: orderData.deliveryFee,
        finalAmount: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderStatus: "Processing",
      });

      return res.json({ success: true, order });
    }

    // SIGNATURE CHECK
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const rawPaymentMethod = orderData?.paymentMethod || "Razorpay";
    const normalizedPaymentMethod =
      typeof rawPaymentMethod === "string"
        ? rawPaymentMethod.trim().toLowerCase() === "cod"
          ? "COD"
          : "Razorpay"
        : "Razorpay";

    // SAVE ORDER
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.userId,
      items: orderData.items,
      totalAmount: orderData.total,
      discount: orderData.discount,
      deliveryFee: orderData.deliveryFee,
      finalAmount: orderData.total,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "Completed",
      paymentVerified: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: "Processing",
    });

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    console.log("Verify Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// ===================== GET ORDERS =====================
router.get("/api/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: orders,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;