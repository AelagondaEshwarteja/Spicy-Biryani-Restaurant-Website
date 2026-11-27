const express = require('express');
const {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Anyone can read the menu
router.get('/', getMenu);
router.get('/:id', getMenuItem);

// Only the admin can change it
router.post('/', protect, createMenuItem);
router.put('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);

module.exports = router;
