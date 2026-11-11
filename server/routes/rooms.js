// ===== ROOMS =====
const router = require('express').Router();
const { Room } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect); // login zaroori

// Sab rooms dekhna
router.get('/', async (req, res) => {
  res.json(await Room.find().sort('roomNumber'));
});

// Naya room banana
router.post('/', allow('admin', 'manager', 'receptionist'), async (req, res) => {
  try {
    res.status(201).json(await Room.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Room edit / status badalna
router.put('/:id', allow('admin', 'manager', 'receptionist', 'housekeeping'), async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

// Room delete
router.delete('/:id', allow('admin', 'manager'), async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
