const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_change_this';

const verifyToken = (req, res, next) => {
    // Try to get token from Authorization header first (for API calls)
    let token = null;
    
    if (req.headers?.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    
    // Fallback to cookies (for traditional form submissions)
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ success: false, message: 'Invalid token: ' + err.message });
    }
};

module.exports = verifyToken;