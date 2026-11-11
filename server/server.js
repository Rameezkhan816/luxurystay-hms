// ===== MAIN SERVER FILE =====
// Yahan se poora backend shuru hota hai. Har URL ek route file se judta hai.
require('dotenv').config();                 // .env ki settings load
const express = require('express');
const cors = require('cors');               // frontend ko ijazat
const helmet = require('helmet');           // security headers
const morgan = require('morgan');           // console mein request log
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false })); // uploaded images/videos dikhane ke liye
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Login par 15 minute mein 20 se zyada koshish nahi (security)
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many attempts, please try again later' } }));

// ---------- ROUTES ----------
// Upload ki hui images/videos is URL se milti hain: /uploads/<file>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', require('./routes/upload'));   // image/video upload
app.use('/api/public', require('./routes/public'));   // landing page ka media (login ke baghair)
app.use('/api/auth', require('./routes/auth'));                 // login, register
app.use('/api/users', require('./routes/users'));               // users (admin)
app.use('/api/rooms', require('./routes/rooms'));               // rooms
app.use('/api/reservations', require('./routes/reservations')); // booking, check-in/out
app.use('/api/billing', require('./routes/billing'));           // bills, invoice
app.use('/api/services', require('./routes/services'));         // guest services
app.use('/api/housekeeping', require('./routes/housekeeping')); // safai
app.use('/api/maintenance', require('./routes/maintenance'));   // kharabi
app.use('/api/feedback', require('./routes/feedback'));         // feedback
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));           // dashboard
app.use('/api/settings', require('./routes/settings'));         // tax, policy

// Database se connect hone ke baad server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server is running')))
  .catch((error) => console.error('Database connection failed:', error.message));
