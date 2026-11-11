// ===== RESERVATIONS: booking, check-in, check-out, cancel =====
const router = require('express').Router();
const { Reservation, Room, Billing, ServiceRequest, Setting, Notification, HousekeepingTask } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);
router.use(allow('admin', 'manager', 'receptionist', 'guest')); // housekeeping ko bookings ki zaroorat nahi
const FRONT_DESK = ['admin', 'manager', 'receptionist'];

// In dates mein jo rooms pehle se booked hain unki ids
async function bookedRoomIds(checkIn, checkOut) {
  const clashing = await Reservation.find({
    status: { $in: ['confirmed', 'checked-in'] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });
  return clashing.map((r) => r.room);
}

// 1) Khali rooms dhoondna
router.get('/available', async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) return res.status(400).json({ message: 'Both dates are required' });
  const booked = await bookedRoomIds(checkIn, checkOut);
  res.json(await Room.find({ _id: { $nin: booked }, status: { $ne: 'maintenance' } }));
});

// 2) Reservations ki list (guest ko sirf apni)
router.get('/', async (req, res) => {
  const filter = req.user.role === 'guest' ? { guest: req.user._id } : {};
  res.json(await Reservation.find(filter).populate('guest', 'name email').populate('room', 'roomNumber type price').sort('-createdAt'));
});

// 3) Nayi booking
router.post('/', async (req, res) => {
  try {
    const { room, checkIn, checkOut } = req.body;
    const guest = req.user.role === 'guest' ? req.user._id : req.body.guest;
    if (!guest) return res.status(400).json({ message: 'Please select a guest' });

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (!(end > start)) return res.status(400).json({ message: 'Check-out must be after check-in' });

    const booked = await bookedRoomIds(checkIn, checkOut);
    if (booked.some((id) => String(id) === String(room))) {
      return res.status(400).json({ message: 'Room is not available for these dates' });
    }

    const roomDoc = await Room.findById(room);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const booking = await Reservation.create({
      guest, room, checkIn: start, checkOut: end,
      totalAmount: nights * roomDoc.price,                          // raatein x rate
      bookingNo: 'LS-' + Math.floor(100000 + Math.random() * 900000), // confirmation number
    });
    await booking.populate('room', 'roomNumber type price');
    await Notification.create({ role: 'receptionist', message: 'New booking: room ' + roomDoc.roomNumber });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4) Cancel
router.put('/:id/cancel', async (req, res) => {
  const booking = await Reservation.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  // Guest sirf apni booking cancel kar sakta hai
  if (req.user.role === 'guest' && String(booking.guest) !== String(req.user._id)) {
    return res.status(403).json({ message: 'You can cancel only your own booking' });
  }
  if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
  booking.status = 'cancelled';
  await booking.save();
  res.json(booking);
});

// 5) Check-in: key card milta hai, room "occupied"
router.put('/:id/checkin', allow(...FRONT_DESK), async (req, res) => {
  const booking = await Reservation.findById(req.params.id).populate('room', 'roomNumber');
  booking.status = 'checked-in';
  booking.keyCard = 'KEY-' + booking.room.roomNumber + '-' + Math.floor(1000 + Math.random() * 9000);
  await booking.save();
  await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });
  res.json(booking);
});

// 6) Check-out: room "cleaning", bill ban jata hai, safai ka task banta hai
router.put('/:id/checkout', allow(...FRONT_DESK), async (req, res) => {
  const booking = await Reservation.findByIdAndUpdate(req.params.id, { status: 'checked-out' }, { new: true });
  await Room.findByIdAndUpdate(booking.room, { status: 'cleaning' });

  // Bill = room charges + services + tax
  const services = await ServiceRequest.find({ reservation: booking._id, status: { $ne: 'pending' } });
  const servicesTotal = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const settings = (await Setting.findOne()) || { taxPercent: 10 };
  const subtotal = booking.totalAmount + servicesTotal;
  const tax = +((subtotal * settings.taxPercent) / 100).toFixed(2);

  const bill = await Billing.create({
    reservation: booking._id, guest: booking.guest,
    roomCharges: booking.totalAmount, services: servicesTotal, tax, total: subtotal + tax,
  });

  await HousekeepingTask.create({ room: booking.room, notes: 'Post check-out cleaning' });
  await Notification.create({ role: 'housekeeping', message: 'Room checked out - cleaning needed' });
  res.json({ reservation: booking, bill });
});

module.exports = router;
