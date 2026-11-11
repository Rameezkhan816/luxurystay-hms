// ===== USERS (sirf Admin manage karta hai) =====
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect); // is file ke sab routes ke liye login zaroori

// Sab users ki list
router.get('/', allow('admin', 'manager', 'receptionist'), async (req, res) => {
  res.json(await User.find().select('-password').sort('-createdAt'));
});

// Naya user/staff banana (sirf admin)
router.post('/', allow('admin'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.password) return res.status(400).json({ message: 'Password is required' });
    data.password = await bcrypt.hash(data.password, 10);
    const user = await User.create(data);
    user.password = undefined; // response mein password na jaye
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User edit karna (password khali chhorein to purana hi rahega)
router.put('/:id', allow('admin'), async (req, res) => {
  const data = { ...req.body };
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  else delete data.password;
  res.json(await User.findByIdAndUpdate(req.params.id, data, { new: true }).select('-password'));
});

// "Delete" asal mein DEACTIVATE hai (record rehta hai, login band ho jata hai)
router.delete('/:id', allow('admin'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ ok: true });
});

module.exports = router;
