// ===== AUTH MIDDLEWARE =====
// Middleware wo function hota hai jo request ko route tak pohnchne se pehle check karta hai.
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// protect: check karta hai ke user login hai ya nahi (token valid hai ya nahi)
exports.protect = async (req, res, next) => {
  try {
    // Token header mein aata hai: "Authorization: Bearer <token>"
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Please log in first' });

    // Token se user ki id nikaal kar database se user dhoondte hain
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    // Agar user nahi mila ya deactivate hai to ijazat nahi
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Account is inactive or does not exist' });
    }

    req.user = user; // aage ke routes mein req.user se user mil jayega
    next();          // agle step par jao
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// allow: sirf di gayi roles ko ijazat deta hai. Misal: allow('admin', 'manager')
exports.allow = (...roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) return next();
  res.status(403).json({ message: 'Your role is not allowed to do this' });
};
