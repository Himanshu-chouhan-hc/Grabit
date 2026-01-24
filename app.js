const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const Feature = require('./module/feature');
const Product = require('./module/product');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/category');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoURL = "mongodb://127.0.0.1:27017/grabitstore";
main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.log("❌", err));

async function main() {
  await mongoose.connect(mongoURL);
}

const port = 9000;

// Routes
app.use(productRoutes);
app.use(adminRoutes);
app.use(authRoutes.router);
app.use(ordersRoutes);
app.use('/category', categoryRoutes);

app.get("/", async (req, res) => {
  try {
    const features = await Feature.find({});
    const bestDeals = await Product.find({ isBestDeal: true }).limit(8);
    const flashDeals = await Product.find({ isFlashDeal: true }).limit(5);
    
    res.render("pages/index", { features, bestDeals, flashDeals });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading page");
  }
});

// Authentication pages
app.get("/auth", (req, res) => {
  res.render("pages/auth");
});

// Cart
app.get("/cart", (req, res) => {
  res.render("pages/cart");
});

// Checkout
app.get("/checkout", (req, res) => {
  res.render("pages/checkout");
});

// Account
app.get("/account", (req, res) => {
  res.render("pages/account");
});

// Category pages
app.get("/mobiles", async (req, res) => {
  try {
    const products = await Product.find({ category: "Mobiles" });
    res.render("pages/Mobiles", { products });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

app.get("/furniture", async (req, res) => {
  try {
    const products = await Product.find({ category: "Furniture" });
    res.render("pages/Furniture", { products });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

app.get("/fashion", async (req, res) => {
  try {
    const products = await Product.find({ category: "Fashion" });
    res.render("pages/Fashion", { products });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

app.get("/electronics", async (req, res) => {
  try {
    const products = await Product.find({ category: "Electronics" });
    res.render("pages/Electronics", { products });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

app.get("/appliances", async (req, res) => {
  try {
    const products = await Product.find({ category: "Appliances" });
    res.render("pages/Appliances", { products });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

app.get("/grocery", async (req, res) => {
  try {
    const products = await Product.find({ category: "Grocery" });
    res.render("pages/Grocery", { products });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

// Product detail page
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("pages/product-detail", { product });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

// Order success page
app.get("/order-success/:orderId", async (req, res) => {
  try {
    res.render("pages/order-success", { orderId: req.params.orderId });
  } catch (err) {
    res.status(500).send("Error loading page");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
