// ===== FEEDBACK (guest ki rating aur comment) =====
const router = require('express').Router();
const { Feedback } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const filter = req.user.role === 'guest' ? { guest: req.user._id } : {};
  res.json(await Feedback.find(filter).populate('guest').sort('-createdAt'));
});

// Sirf guest feedback de sakta hai
router.post('/', allow('guest'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    res.status(201).json(await Feedback.create({ guest: req.user._id, rating, comment }));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', allow('admin', 'manager'), async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
