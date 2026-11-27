const express = require('express');
const {
  createOrder,
  trackOrder,
  getOrders,
  getOrderStats,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Customer routes
router.post('/', createOrder);
router.get('/track/:orderNumber', trackOrder);

// Admin routes
router.get('/', protect, getOrders);
router.get('/stats', protect, getOrderStats);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;
