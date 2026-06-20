const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const router = express.Router();

const User = require('../module/user');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/verify');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// ✅ SINGLE SECRET ONLY
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';


// ================= MULTER SETUP =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


// ================= GOOGLE STRATEGY =================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


// ================= GOOGLE LOGIN =================
router.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


// ================= GOOGLE CALLBACK =================
router.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.redirect(
      `/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`
    );
  }
);


// ================= SIGNUP =================
router.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.json({ success: false, message: 'All fields required' });
    }

    if (password !== confirmPassword) {
      return res.json({ success: false, message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({ success: true, user, token });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


// ================= LOGIN =================
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({ success: true, user, token });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


// ================= PROFILE GET =================
router.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});


// ================= PROFILE UPDATE =================
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
    res.json({ success: false, message: err.message });
  }
});


// ================= IMAGE UPLOAD (FINAL FIXED) =================
router.post(
  '/api/auth/upload-picture',
  verifyToken,
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.json({ success: false, message: 'No file uploaded' });
      }

      const imagePath = '/uploads/' + req.file.filename;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { profileImage: imagePath },
        { new: true }
      );

      res.json({
        success: true,
        profileImage: imagePath,
        data: user
      });

    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }
);

module.exports = { router, upload };