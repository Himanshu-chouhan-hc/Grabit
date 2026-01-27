const express = require('express');
const router = express.Router();
const User = require('../module/user');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const JWT_SECRET = 'your_jwt_secret_key_change_this';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Sign Up
router.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    console.log('Creating new user:', { name, email });
    const user = new User({ name, email, password });
    await user.save();
    console.log('User created:', user._id);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Account created successfully',
      user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage },
      token,
    });
  } catch (err) {
    console.error('Signup error:', err.message, err.code);
    
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage },
      token,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user profile
router.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile
router.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add address
router.post('/api/auth/address', verifyToken, async (req, res) => {
  try {
    const { name, street, city, state, pincode } = req.body;
    const user = await User.findById(req.userId);

    user.addresses.push({ name, street, city, state, pincode });
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Logout (client-side, just for reference)
router.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// DELETE REVIEW ROUTE
router.delete('/api/products/:productId/review/:reviewId', verifyToken, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    
    // Product model ko yahan require karein (agar upar nahi kiya hai)
    const Product = require('../module/product'); 

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product nahi mila" });
    }

    // Review find karein array ke andar se
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review nahi mila" });
    }

    // Security Check: Kya wahi user delete kar raha hai jisne review likha tha?
    // Aapne verifyToken mein 'req.userId' set kiya hai, toh hum wahi use karenge
    if (review.reviewerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Aap sirf apna review delete kar sakte hain!" 
      });
    }

    // Review remove karein
    product.reviews.pull(reviewId);
    await product.save();

    res.json({ success: true, message: "Review successfully delete" });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
});

// Upload profile picture
router.post('/api/auth/upload-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const picturePath = '/uploads/' + req.file.filename;
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: picturePath },
      { new: true }
    );

    // Update all reviews by this user with the new picture
    const Product = require('../module/product');
    await Product.updateMany(
      { 'reviews.reviewerId': req.userId },
      { 
        '$set': { 
          'reviews.$[elem].reviewerImage': picturePath 
        } 
      },
      { 
        arrayFilters: [{ 'elem.reviewerId': req.userId }],
        multi: true
      }
    );

    console.log(`Updated all reviews for user ${req.userId} with new picture`);

    res.json({ success: true, message: 'Picture uploaded and all reviews updated', profileImage: user.profileImage });
  } catch (err) {
    console.error('Upload picture error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router: router, verifyToken, upload };
