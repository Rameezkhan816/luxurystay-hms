// ===== FILE UPLOAD (image ya video) =====
// Frontend file bhejta hai -> yahan uploads/ folder mein save hoti hai -> URL wapas milta hai.
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

const folder = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(folder, { recursive: true }); // folder na ho to bana do

const storage = multer.diskStorage({
  destination: folder,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase()),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // zyada se zyada 50 MB
  fileFilter: (req, file, cb) => {
    // Sirf image ya video allowed
    if (/^(image|video)\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images or videos can be uploaded'));
  },
});

router.post('/', protect, (req, res) => {
  upload.single('file')(req, res, (error) => {
    if (error) return res.status(400).json({ message: error.message });
    if (!req.file) return res.status(400).json({ message: 'No file received' });
    res.json({ url: '/uploads/' + req.file.filename });
  });
});

module.exports = router;
