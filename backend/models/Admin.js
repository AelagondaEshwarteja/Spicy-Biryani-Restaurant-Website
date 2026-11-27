const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false means the password is never returned by normal queries
    password: { type: String, required: true, minlength: 6, select: false },
  },
  { timestamps: true }
);

// Before saving, turn the plain password into a hash.
// We never store the real password in the database.
adminSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Used at login to check the password the user typed
adminSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
