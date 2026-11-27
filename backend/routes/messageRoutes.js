const express = require('express');
const {
  createMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAllow } = require('../middleware/errorMiddleware');

const router = express.Router();

router.post('/', createMessage); // contact form (public)
router.get('/', protect, getMessages);
router
  .route('/:id/read')
  .patch(protect, markAsRead)
  .all(onlyAllow('PATCH', 'Use the tick button in the Messages tab of the admin dashboard.'));
router.delete('/:id', protect, deleteMessage);

module.exports = router;
