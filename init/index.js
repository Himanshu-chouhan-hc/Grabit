const mongoose = require("mongoose");
const initData = require("./data.js");
const productData = require("./products.js");
const Feature = require("../module/feature.js");
const Product = require("../module/product.js");


main()
  .then(() => {
    console.log("Connected to MongoDB");
    initDB();
  })
  .catch((err) => console.log("Connection error:", err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/grabitstore");
}

async function initDB() {
  try {
    // Clear and initialize features
    await Feature.deleteMany({});
    console.log("Cleared existing features");

    await Feature.insertMany(initData.data);
    console.log("✅ Inserted sample data into features collection");

    // Clear and initialize products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    const insertedProducts = await Product.insertMany(productData.data);
    console.log(`✅ Inserted ${insertedProducts.length} products into database`);

    process.exit(0);
  } catch (err) {
    console.log("❌ Error initializing database:", err);
    process.exit(1);
  } 
}