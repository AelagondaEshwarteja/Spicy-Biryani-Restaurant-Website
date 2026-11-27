// Puts the default menu and the admin account into MongoDB.
//
// - When the server starts, it calls seedDatabase({ reset: false }):
//   it only adds data if the database is empty, so your changes are never lost.
// - When you run "npm run seed", it calls seedDatabase({ reset: true }):
//   the menu is deleted and added again from menuData.js.

require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Admin = require('../models/Admin');
const menuData = require('./menuData');

async function seedDatabase({ reset = false } = {}) {
  // ---------- Menu ----------
  if (reset) {
    await MenuItem.deleteMany({});
    console.log('Old menu removed');
  }

  const menuCount = await MenuItem.countDocuments();
  if (menuCount === 0) {
    await MenuItem.insertMany(menuData);
    console.log(`Added ${menuData.length} menu items`);
  }

  // ---------- Admin account ----------
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD missing in .env - admin account not created');
    return;
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin) {
    await Admin.create({ email, password });
    console.log(`Admin account created for ${email}`);
  } else if (reset) {
    admin.password = password; // the pre-save hook hashes it again
    await admin.save();
    console.log(`Admin password for ${email} updated from .env`);
  }
}

// This part only runs for "npm run seed" (not when server.js imports this file)
if (require.main === module) {
  const connectDB = require('../config/db');

  connectDB()
    .then(() => seedDatabase({ reset: true }))
    .then(() => {
      console.log('Seeding finished');
      return mongoose.disconnect();
    })
    .catch((error) => {
      console.error('Seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
