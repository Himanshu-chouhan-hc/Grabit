const express = require('express');
const router = express.Router();
const Product = require('../module/product');

// Get products by category
router.get('/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category: category });
    
    res.render('pages/category', { 
      products, 
      category,
      user: req.user || null 
    });
  } catch (error) {
    console.log('Error fetching category:', error);
    res.status(500).render('error', { message: 'Error loading category' });
  }
});

module.exports = router;
