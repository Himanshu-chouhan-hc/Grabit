const express = require('express');
const router = express.Router();
const User = require('../module/user');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/verify'); // No curly braces

const JWT_SECRET = 'your_jwt_secret_key_change_this';

// Multer storage logic... (Aapka purana wala code hi rahega)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes (Signup, Login, Profile)
router.post('/api/auth/signup', async (req, res) => { /* ... */ });
router.post('/api/auth/login', async (req, res) => { /* ... */ });

router.get('/api/auth/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// module.exports ko clean rakhein
module.exports = { router, upload };