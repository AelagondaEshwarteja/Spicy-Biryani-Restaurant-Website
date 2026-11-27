const express = require('express');
const {
  createOrder,
  trackOrder,
  getOrders,
  getOrderStats,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { onlyAllow } = require('../middleware/errorMiddleware');

const router = express.Router();

// Customer routes
router.post('/', createOrder);
router.get('/track/:orderNumber', trackOrder);

// Admin routes
router.get('/', protect, getOrders);
router.get('/stats', protect, getOrderStats);
router
  .route('/:id/status')
  .patch(protect, updateOrderStatus)
  .all(
    onlyAllow(
      'PATCH',
      'Use the "Mark as" buttons in the admin dashboard, or send PATCH with the body { "status": "confirmed" } and your login token.'
    )
  );

module.exports = router;
