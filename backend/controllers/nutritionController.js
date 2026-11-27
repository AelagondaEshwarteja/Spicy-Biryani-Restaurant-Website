const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const { getNutritionTips } = require('../utils/nutritionTips');

const DAILY_CALORIES = 2000; // average adult daily need, used for the % figure

// @route  POST /api/nutrition/analyze   body: { items: [{ menuItemId, quantity }] }
// @access Public
// Adds up the nutrition of everything in the cart and gives simple tips.
async function analyzeMeal(req, res, next) {
  try {
    const cartItems = Array.isArray(req.body.items) ? req.body.items : [];
    const validItems = cartItems.filter((item) => mongoose.isValidObjectId(item.menuItemId));

    if (validItems.length === 0) {
      return res.status(400).json({ message: 'Add some items to your cart first' });
    }

    const menuItems = await MenuItem.find({ _id: { $in: validItems.map((i) => i.menuItemId) } })
      .select('name category nutrition')
      .lean();

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const categories = [];

    validItems.forEach((cartItem) => {
      const menuItem = menuItems.find((m) => m._id.toString() === String(cartItem.menuItemId));
      if (!menuItem) return;

      const quantity = Math.min(20, Math.max(1, parseInt(cartItem.quantity, 10) || 1));
      Object.keys(totals).forEach((key) => {
        totals[key] += (menuItem.nutrition[key] || 0) * quantity;
      });
      categories.push(menuItem.category);
    });

    // Round to whole numbers so the UI looks clean
    Object.keys(totals).forEach((key) => {
      totals[key] = Math.round(totals[key]);
    });

    res.json({
      totals,
      dailyCaloriePercent: Math.round((totals.calories / DAILY_CALORIES) * 100),
      tips: getNutritionTips(totals, categories),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { analyzeMeal };
