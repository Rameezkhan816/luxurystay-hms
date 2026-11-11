// ===== GUEST SERVICES (room service, laundry, wake-up call, transport) =====
const router = require('express').Router();
const { ServiceRequest, Reservation, Notification } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);
router.use(allow('admin', 'manager', 'receptionist', 'guest')); // housekeeping ko services nahi chahiye

// Guest ko sirf apni requests, staff ko sab
router.get('/', async (req, res) => {
  const filter = req.user.role === 'guest' ? { guest: req.user._id } : {};
  res.json(await ServiceRequest.find(filter).populate('guest reservation').sort('-createdAt'));
});

// Nayi request (guest ya staff)
router.post('/', async (req, res) => {
  try {
    const booking = await Reservation.findById(req.body.reservation);
    if (!booking) return res.status(400).json({ message: 'Please select a booking' });

    const service = await ServiceRequest.create({
      type: req.body.type,
      details: req.body.details,
      reservation: booking._id,
      guest: booking.guest,
      price: req.user.role === 'guest' ? 0 : req.body.price, // price sirf staff lagata hai
    });
    await Notification.create({ role: 'receptionist', message: 'New guest service request' });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Staff price aur status update karta hai
router.put('/:id', allow('admin', 'manager', 'receptionist'), async (req, res) => {
  res.json(await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/:id', allow('admin', 'manager'), async (req, res) => {
  await ServiceRequest.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
