// ===== REPORTS (dashboard ke numbers) =====
const router = require('express').Router();
const { Room, Billing, Reservation, Feedback } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, allow('admin', 'manager'), async (req, res) => {
  const rooms = await Room.find();
  const bills = await Billing.find();
  const bookings = await Reservation.find();
  const feedback = await Feedback.find();

  // Occupancy = occupied rooms / total rooms
  const occupied = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyRate = rooms.length ? +((occupied * 100) / rooms.length).toFixed(1) : 0;

  // Mahine ke hisaab se revenue
  const revenueMap = {};
  bills.forEach((b) => {
    const month = b.createdAt.toISOString().slice(0, 7);
    revenueMap[month] = (revenueMap[month] || 0) + b.total;
  });

  // Mahine ke hisaab se bookings
  const bookingMap = {};
  bookings.forEach((b) => {
    const month = b.checkIn.toISOString().slice(0, 7);
    bookingMap[month] = (bookingMap[month] || 0) + 1;
  });
  const bookingsByMonth = Object.entries(bookingMap).sort().map(([month, count]) => ({ month, bookings: count }));

  // Forecast = pichle 3 mahine ka average
  const last3 = bookingsByMonth.slice(-3);
  const forecast = last3.length ? Math.round(last3.reduce((s, m) => s + m.bookings, 0) / last3.length) : 0;

  // Pricing tip occupancy se
  let pricingTip = 'Demand is balanced: keep rates unchanged.';
  if (occupancyRate > 80) pricingTip = 'Demand is high: consider raising rates by 10%.';
  if (occupancyRate < 40) pricingTip = 'Demand is low: consider a 10% discount or special offer.';

  // Rooms ki status ginti (pie chart)
  const statusMap = {};
  rooms.forEach((r) => { statusMap[r.status] = (statusMap[r.status] || 0) + 1; });

  res.json({
    totalRooms: rooms.length,
    occupied,
    occupancyRate,
    totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
    reservations: bookings.length,
    avgRating: feedback.length ? +(feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : 0,
    revenueByMonth: Object.entries(revenueMap).map(([month, revenue]) => ({ month, revenue })),
    roomStatus: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
    bookingsByMonth, forecast, pricingTip,
  });
});

module.exports = router;
