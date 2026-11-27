const MenuItem = require('../models/MenuItem');
const { escapeRegex } = require('../utils/helpers');

// Fields the admin is allowed to change. Anything else in the body is ignored.
const EDITABLE_FIELDS = [
  'name',
  'description',
  'price',
  'category',
  'image',
  'spiceLevel',
  'servingSize',
  'isVeg',
  'isVegan',
  'isGlutenFree',
  'isBestseller',
  'isAvailable',
  'nutrition',
];

function pickEditableFields(body) {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
}

// @route  GET /api/menu?category=biryani&veg=true&search=chicken
// @access Public
async function getMenu(req, res, next) {
  try {
    const { category, veg, search } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = String(category);
    if (veg === 'true') filter.isVeg = true;
    if (search) filter.name = { $regex: escapeRegex(String(search)), $options: 'i' };

    // .lean() returns plain objects instead of full Mongoose documents, which is faster
    const items = await MenuItem.find(filter)
      .sort({ _id: 1 })
      .select('-__v -createdAt -updatedAt')
      .lean();

    // Let the browser reuse this response for 60 seconds
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ count: items.length, items });
  } catch (error) {
    next(error);
  }
}

// @route  GET /api/menu/:id
// @access Public
async function getMenuItem(req, res, next) {
  try {
    const item = await MenuItem.findById(req.params.id).select('-__v').lean();
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

// @route  POST /api/menu
// @access Admin
async function createMenuItem(req, res, next) {
  try {
    const item = await MenuItem.create(pickEditableFields(req.body));
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

// @route  PUT /api/menu/:id
// @access Admin
async function updateMenuItem(req, res, next) {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, pickEditableFields(req.body), {
      new: true, // return the updated item
      runValidators: true, // still check the schema rules (e.g. price >= 0)
    });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

// @route  DELETE /api/menu/:id
// @access Admin
async function deleteMenuItem(req, res, next) {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: `${item.name} removed from the menu` });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };
