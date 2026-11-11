// ===== DATABASE MODELS (MongoDB collections) =====
// Har model ek table jaisa hai. 'ref' ka matlab doosre model se link (jaise reservation -> room).
const m = require('mongoose'); const S = m.Schema, O = S.Types.ObjectId;
const mk = (n, d) => m.model(n, new S(d, { timestamps: true }));
const ref = (r) => ({ type: O, ref: r });
module.exports = {
  User: mk('User', { name: String, email: { type: String, unique: true }, password: String, phone: String, preferences: String, consent: Boolean, consentAt: Date,
    role: { type: String, enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'guest'], default: 'guest' }, isActive: { type: Boolean, default: true } }),
  Room: mk('Room', { roomNumber: { type: String, unique: true }, type: String, price: Number, floor: Number, amenities: String, image: String,
    status: { type: String, enum: ['available', 'occupied', 'cleaning', 'maintenance'], default: 'available' } }),
  Reservation: mk('Reservation', { guest: ref('User'), room: ref('Room'), checkIn: Date, checkOut: Date, totalAmount: Number, bookingNo: String, keyCard: String,
    status: { type: String, enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'], default: 'confirmed' } }),
  Billing: mk('Billing', { reservation: ref('Reservation'), guest: ref('User'), roomCharges: Number, services: Number, tax: Number, total: Number,
    paymentStatus: { type: String, default: 'unpaid' } }),
  ServiceRequest: mk('ServiceRequest', { guest: ref('User'), reservation: ref('Reservation'),
    type: { type: String, enum: ['room service', 'laundry', 'wake-up call', 'transport'] }, details: String, price: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' } }),
  HousekeepingTask: mk('HousekeepingTask', { room: ref('Room'), assignedTo: ref('User'), scheduledAt: Date, notes: String,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' } }),
  MaintenanceRequest: mk('MaintenanceRequest', { room: ref('Room'), guest: ref('User'), description: String, media: String,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' } }),
  Feedback: mk('Feedback', { guest: ref('User'), rating: { type: Number, min: 1, max: 5 }, comment: String }),
  Notification: mk('Notification', { role: String, message: String, isRead: { type: Boolean, default: false } }),
  Setting: mk('Setting', { heroVideo: String, heroImage: String, taxPercent: { type: Number, default: 10 }, checkInTime: { type: String, default: '14:00' }, checkOutTime: { type: String, default: '12:00' }, policy: { type: String, default: 'Free cancellation up to 24 hours before check-in.' } }),
};
