require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const mongoose = require("mongoose");
const initData = require("./data.js");
const productData = require("./products.js");
const Feature = require("../module/feature.js");
const Product = require("../module/product.js");

async function main() {
  const MONGO_URI = process.env.ATLAS_DB;
  if (!MONGO_URI) {
    throw new Error("❌ Mongo URI not defined. Check your .env file.");
  }
  console.log("Connecting to MongoDB at:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
}

main()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    return initDB();
  })
  .catch((err) => console.error("❌ Connection error:", err));

async function initDB() {
  try {
    // Clear and initialize features
    await Feature.deleteMany({});
    console.log("Cleared existing features");
    await Feature.insertMany(initData.data);
    console.log("✅ Inserted sample features");

    // Clear and initialize products
    await Product.deleteMany({});
    console.log("Cleared existing products");
    const insertedProducts = await Product.insertMany(productData.data);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  }
}