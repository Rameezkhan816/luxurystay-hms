// ===== HOUSEKEEPING TASKS (safai ke kaam) =====
const router = require('express').Router();
const { HousekeepingTask, Room } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);
const STAFF = ['admin', 'manager', 'receptionist', 'housekeeping'];

router.get('/', allow(...STAFF), async (req, res) => {
  res.json(await HousekeepingTask.find().populate('room assignedTo').sort('-createdAt'));
});

router.post('/', allow(...STAFF), async (req, res) => {
  try {
    res.status(201).json(await HousekeepingTask.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Task update. Safai complete ho to room dobara "available" ho jata hai
router.put('/:id', allow(...STAFF), async (req, res) => {
  const task = await HousekeepingTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (task.status === 'completed' && task.room) {
    await Room.updateOne({ _id: task.room, status: 'cleaning' }, { status: 'available' });
  }
  res.json(task);
});

router.delete('/:id', allow('admin', 'manager'), async (req, res) => {
  await HousekeepingTask.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
