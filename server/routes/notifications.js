// ===== NOTIFICATIONS =====
const router = require('express').Router();
const { Notification } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// Admin ko sab, baqi ko sirf apne role ki notifications
router.get('/', async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { role: req.user.role };
  res.json(await Notification.find(filter).sort('-createdAt'));
});

// "Read" mark karna
router.put('/:id', allow('admin', 'manager', 'receptionist', 'housekeeping'), async (req, res) => {
  res.json(await Notification.findByIdAndUpdate(req.params.id, { isRead: req.body.isRead }, { new: true }));
});

router.delete('/:id', allow('admin', 'manager'), async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
