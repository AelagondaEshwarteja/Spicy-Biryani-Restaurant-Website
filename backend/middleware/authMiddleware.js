const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Put this before any route that only the admin should use.
// It reads the token from the "Authorization: Bearer <token>" header and checks it.
async function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please log in as admin' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found' });
    }

    req.admin = admin; // the next function can use req.admin
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

module.exports = { protect };
