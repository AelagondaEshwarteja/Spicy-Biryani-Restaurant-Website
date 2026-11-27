const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function createToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

// @route  POST /api/auth/login   body: { email, password }
// @access Public
async function login(req, res, next) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // The password field is hidden by default, so we ask for it here with "+password"
    const admin = await Admin.findOne({ email }).select('+password');

    // Same message for wrong email and wrong password, so nobody can guess which emails exist
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    res.json({
      token: createToken(admin._id),
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    next(error);
  }
}

// @route  GET /api/auth/me
// @access Admin
function getMe(req, res) {
  const { _id, name, email } = req.admin;
  res.json({ admin: { id: _id, name, email } });
}

module.exports = { login, getMe };
