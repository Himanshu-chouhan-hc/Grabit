const express = require('express');
const router = express.Router();
const Product = require('../module/product');

// Create product
router.post('/admin/products', async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, image, stock, discount, isBestDeal, isFlashDeal } = req.body;

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      stock,
      discount,
      isBestDeal,
      isFlashDeal,
    });

    await product.save();
    res.json({ success: true, data: product, message: 'Product created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update product
router.put('/admin/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete product
router.delete('/admin/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' }); 
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all products (admin)
router.get('/admin/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
