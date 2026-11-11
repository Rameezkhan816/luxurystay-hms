// ===== SETTINGS (tax, timings, policy) - sirf admin badal sakta hai =====
const router = require('express').Router();
const { Setting } = require('../models');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  res.json((await Setting.findOne()) || (await Setting.create({})));
});

router.put('/', allow('admin'), async (req, res) => {
  const settings = (await Setting.findOne()) || (await Setting.create({}));
  Object.assign(settings, req.body);
  res.json(await settings.save());
});

module.exports = router;
