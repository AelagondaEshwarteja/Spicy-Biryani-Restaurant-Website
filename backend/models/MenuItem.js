const mongoose = require('mongoose');

const CATEGORIES = ['biryani', 'starters', 'curries', 'breads', 'desserts', 'beverages'];

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: CATEGORIES },
    image: { type: String, required: true },

    // 0 = not spicy, 3 = very spicy
    spiceLevel: { type: Number, min: 0, max: 3, default: 1 },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    ratingCount: { type: Number, default: 0 },
    servingSize: { type: String, default: '1 plate' },

    isVeg: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },

    // Approximate values for one serving
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Index so "get all biryanis" style queries stay fast
menuItemSchema.index({ category: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
module.exports.CATEGORIES = CATEGORIES;
