const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAllow } = require('../middleware/errorMiddleware');

const router = express.Router();

router
  .route('/login')
  .post(login)
  .all(onlyAllow('POST', 'Log in from the /admin page of the website, or send POST with { "email", "password" }.'));
router.get('/me', protect, getMe);

module.exports = router;
