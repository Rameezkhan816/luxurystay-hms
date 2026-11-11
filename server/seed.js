// Yeh file SIRF EK admin account banati hai (koi fake user ya room nahi).
// Admin ki email/password .env file se aati hai (ADMIN_EMAIL, ADMIN_PASSWORD).
// Chalane ka tareeqa:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Setting } = require('./models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL || 'admin@luxurystay.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

  // Agar admin pehle se hai to dobara nahi banega (purana data safe rehta hai)
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email,
      role: 'admin',
      password: await bcrypt.hash(password, 10), // password hash karke save hota hai
    });
    console.log('Admin created ->', email);
  }

  // Default settings (tax wagaira) sirf ek dafa banti hain
  if (!(await Setting.findOne())) await Setting.create({});
  process.exit();
}
seed();
