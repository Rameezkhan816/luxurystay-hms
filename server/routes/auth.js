// ===== AUTH ROUTES: register, login, me =====
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

// Token banata hai jo 7 din tak chalta hai
const makeToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Frontend ko sirf zaroori info bhejte hain (password kabhi nahi)
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register  -> naya GUEST account (staff sirf admin banata hai)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, consent } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, email and password (min. 6 characters) are required' });
    }
    // GDPR: data processing ki ijazat (consent) zaroori hai
    if (!consent) return res.status(400).json({ message: 'Data consent is required' });
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10); // password encrypt (hash)
    const user = await User.create({ name, email, phone, password: hashed, role: 'guest', consent: true, consentAt: new Date() });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // Password ko hash se compare karte hain
  const ok = user && (await bcrypt.compare(password || '', user.password));
  if (!ok) return res.status(400).json({ message: 'Incorrect email or password' });
  if (!user.isActive) return res.status(403).json({ message: 'Your account is deactivated' });

  // Agar user ne login form par role chuna hai to wo account ke role se match hona chahiye
  if (req.body.role && req.body.role !== user.role) {
    return res.status(400).json({ message: `This account is "${user.role}". Please select the "${user.role}" role above.` });
  }

  res.json({ token: makeToken(user), user: publicUser(user) });
});

// GET /api/auth/me -> abhi login user ki info
router.get('/me', protect, (req, res) =>
  res.json({ ...publicUser(req.user), phone: req.user.phone, preferences: req.user.preferences }));

// PUT /api/auth/profile -> user apna naam, phone, preferences khud badal sakta hai (role nahi)
router.put('/profile', protect, async (req, res) => {
  const { name, phone, preferences } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, preferences }, { new: true });
  res.json({ ...publicUser(user), phone: user.phone, preferences: user.preferences });
});

module.exports = router;
