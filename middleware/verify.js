const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_change_this';

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        
        // Error prevention check
        if (typeof next === 'function') {
            next();
        } else {
            console.error("Middleware Error: 'next' is not a function. Check route registration.");
            res.status(500).send("Internal Server Error");
        }
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = verifyToken;