// ===== BILLING & INVOICE =====
const router = require('express').Router();
const { Billing } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);
router.use(allow('admin', 'manager', 'receptionist', 'guest')); // housekeeping ko billing nahi dikhti

// Bills ki list (guest ko sirf apne)
router.get('/', async (req, res) => {
  const filter = req.user.role === 'guest' ? { guest: req.user._id } : {};
  res.json(
    await Billing.find(filter)
      .populate('guest', 'name email phone')
      .populate({ path: 'reservation', populate: { path: 'room', select: 'roomNumber type price' } })
      .sort('-createdAt')
  );
});

// Bill "paid" mark karna
router.put('/:id/pay', allow('admin', 'manager', 'receptionist'), async (req, res) => {
  res.json(await Billing.findByIdAndUpdate(req.params.id, { paymentStatus: 'paid' }, { new: true }));
});

// Invoice email karna (.env mein SMTP settings honi chahiye)
router.post('/:id/email', async (req, res) => {
  try {
    if (!process.env.SMTP_HOST) return res.status(400).json({ message: 'Email is not set up (add SMTP_HOST, SMTP_USER, SMTP_PASS to .env)' });

    const bill = await Billing.findById(req.params.id).populate('guest', 'name email');
    const nodemailer = require('nodemailer');
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({
      from: process.env.SMTP_USER,
      to: bill.guest.email,
      subject: 'LuxuryStay Invoice',
      html: `<h2>LuxuryStay Invoice</h2><p>Room: $${bill.roomCharges}</p><p>Services: $${bill.services}</p><p>Tax: $${bill.tax}</p><h3>Total: $${bill.total}</h3>`,
    });
    res.json({ message: 'Invoice sent to ' + bill.guest.email + ' emailed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Email failed: ' + error.message });
  }
});

module.exports = router;
