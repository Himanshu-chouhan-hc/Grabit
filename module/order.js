const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  totalAmount: Number,
  discount: Number,
  deliveryFee: Number,
  finalAmount: Number,
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
  },
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "Debit Card", "UPI", "Wallet", "COD"],
    default: "COD",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  orderStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Processing",
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  orderDate: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = "ORD" + Date.now();
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
