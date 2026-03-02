const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const cookieParser = require('cookie-parser');
require("dotenv").config();

// Models
const Feature = require('./module/feature');
const Product = require('./module/product');

// Route Imports
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/category');
const verifyToken = require('./middleware/verify');

// View Engine Settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejsMate);

// --- Middlewares (ORDER IS IMPORTANT) ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // Verify.js ke liye zaroori hai
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
const MONGO_URI = process.env.ATLAS_DB;
if (!MONGO_URI) {
  throw new Error("❌ Mongo URI not defined. Check your .env file.");
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to DB"))
  .catch(err => console.error("❌ DB Error:", err));


// --- Route Mounting ---
app.use(productRoutes);
app.use(adminRoutes);
app.use(authRoutes.router); // Auth logic
app.use(ordersRoutes);      // Orders logic
app.use('/category', categoryRoutes);

// --- Main Pages APIs ---

// Home Page
app.get("/", async (req, res) => {
  try {
    const features = await Feature.find({});
    const bestDeals = await Product.find({ isBestDeal: true }).limit(8);
    const flashDeals = await Product.find({ isFlashDeal: true }).limit(5);
    res.render("pages/index", { features, bestDeals, flashDeals });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading home page");
  }
});

// Auth, Cart, Checkout, Account
app.get("/auth", (req, res) => res.render("pages/auth"));
app.get("/cart", (req, res) => res.render("pages/cart"));
app.get("/checkout", (req, res) => res.render("pages/checkout"));
app.get("/account", (req, res) => res.render("pages/account"));
app.get("/orders", verifyToken, (req, res) => {
  res.render("pages/orders", { userId: req.user.id });
});
// --- Category Pages APIs ---

app.get("/mobiles", async (req, res) => {
  try {
    const products = await Product.find({ category: "Mobiles" });
    res.render("pages/Mobiles", { category: "Mobiles", products });
  } catch (err) { res.status(500).send("Error"); }
});

app.get("/furniture", async (req, res) => {
  try {
    const products = await Product.find({ category: "Furniture" });
    res.render("pages/Furniture", { category: "Furniture", products });
  } catch (err) { res.status(500).send("Error"); }
});

app.get("/fashion", async (req, res) => {
  try {
    const products = await Product.find({ category: "Fashion" });
    res.render("pages/Fashion", { category: "Fashion", products });
  } catch (err) { res.status(500).send("Error"); }
});

app.get("/beauty-toys", async (req, res) => {
  try {
    const products = await Product.find({ category: "Beauty & Toys" });
    res.render("pages/Toy", { category: "Beauty & Toys", products });
  } catch (err) { res.status(500).send("Error"); }
});

app.get("/electronics", async (req, res) => {
  try {
    const products = await Product.find({ category: "Electronics" });
    res.render("pages/Electronics", { category: "Electronics", products });
  } catch (err) { res.status(500).send("Error"); }
});

app.get("/appliances", async (req, res) => {
  try {
    const products = await Product.find({ category: "Appliances" });
    res.render("pages/Appliances", { category: "Appliances", products });
  } catch (err) { res.status(500).send("Error"); }
});

app.get("/grocery", async (req, res) => {
  try {
    const products = await Product.find({ category: "Grocery" });
    res.render("pages/Grocery", { category: "Grocery", products });
  } catch (err) { res.status(500).send("Error"); }
});

// Product Detail Page
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.render("pages/product-detail", { product });
  } catch (err) { res.status(500).send("Error"); }
});

// Order Success Page
app.get("/order-success/:orderId", (req, res) => {
  res.render("pages/order-success", { orderId: req.params.orderId });
});

// Server Listen
const port = 9000;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});