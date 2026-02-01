const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: String,
  reviewer: String,
  reviewerId: mongoose.Schema.Types.ObjectId,
  reviewerImage: String,
  date: {
    type: Date,
    default: Date.now,

  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  originalPrice: Number,
  category: {
    type: String,
    enum: ["Mobiles", "Furniture", "Fashion", "Appliances", "Electronics", "Beauty & Toys", "Grocery"],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4,
  },
  reviews: [reviewSchema],
  stock: {
    type: Number,
    default: 100,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isBestDeal: {
    type: Boolean,
    default: false,
  },
  isFlashDeal: {
    type: Boolean,
    default: false,
  },
  flashDealExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
