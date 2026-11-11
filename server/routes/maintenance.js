// ===== MAINTENANCE REQUESTS (kharabi ki report) =====
const router = require('express').Router();
const { MaintenanceRequest, Room, Notification } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);
const STAFF = ['admin', 'manager', 'receptionist', 'housekeeping'];

router.get('/', async (req, res) => {
  const filter = req.user.role === 'guest' ? { guest: req.user._id } : {};
  res.json(await MaintenanceRequest.find(filter).populate('room guest').sort('-createdAt'));
});

// Guest ya staff masla report kar sakta hai
router.post('/', async (req, res) => {
  try {
    const data = { room: req.body.room, description: req.body.description, priority: req.body.priority, media: req.body.media };
    if (req.user.role === 'guest') data.guest = req.user._id;
    const request = await MaintenanceRequest.create(data);

    if (data.room) await Room.updateOne({ _id: data.room, status: { $ne: 'occupied' } }, { status: 'maintenance' });
    await Notification.create({ role: 'manager', message: 'New maintenance request received' });
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Status update. Resolve hone par room wapas "available"
router.put('/:id', allow(...STAFF), async (req, res) => {
  const request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (request.status === 'resolved' && request.room) {
    await Room.updateOne({ _id: request.room, status: 'maintenance' }, { status: 'available' });
  }
  res.json(request);
});

router.delete('/:id', allow('admin', 'manager'), async (req, res) => {
  await MaintenanceRequest.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
