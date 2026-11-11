// ===== PUBLIC (bina login ke) - landing page ki video/image =====
const router = require('express').Router();
const { Setting } = require('../models');

router.get('/', async (req, res) => {
  const settings = await Setting.findOne();
  res.json({ heroVideo: (settings && settings.heroVideo) || '', heroImage: (settings && settings.heroImage) || '' });
});

module.exports = router;
