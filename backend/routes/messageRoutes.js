const express = require('express');
const {
  createMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createMessage); // contact form (public)
router.get('/', protect, getMessages);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
