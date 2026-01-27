const express = require('express');
const router = express.Router();
const Product = require('../module/product');

// Get all products with filters
router.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort, limit = 20, page = 1 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let products = Product.find(query);

    if (sort === 'price-low') {
      products = products.sort({ price: 1 });
    } else if (sort === 'price-high') {
      products = products.sort({ price: -1 });
    } else if (sort === 'rating') {
      products = products.sort({ rating: -1 });
    } else if (sort === 'newest') {
      products = products.sort({ createdAt: -1 });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    products = products.skip(skip).limit(parseInt(limit));

    const data = await products;
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get best deals
router.get('/api/best-deals', async (req, res) => {
  try {
    const products = await Product.find({ isBestDeal: true }).limit(8);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get flash deals
router.get('/api/flash-deals', async (req, res) => {
  try {
    const products = await Product.find({ isFlashDeal: true }).limit(5);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single product
router.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// Add review
router.post('/api/products/:id/review', async (req, res) => {
  try {
    console.log('Review submission received:', req.body);
    const { rating, comment, reviewer, reviewerId, reviewerImage } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviewData = { 
      rating, 
      comment, 
      reviewer,
      reviewerId,
      reviewerImage 
    };

    console.log('Adding review:', reviewData);
    product.reviews.push(reviewData);

    // Update average rating
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    product.rating = avgRating;

    await product.save();
    console.log('Review saved. Total reviews:', product.reviews.length);
    
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Review submission error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
