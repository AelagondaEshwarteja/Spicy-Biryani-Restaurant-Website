const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Message = require('../models/Message');
const { ORDER_STATUSES, PAYMENT_METHODS } = require('../models/Order');
const { calculateBill } = require('../utils/billing');
const {
  generateOrderNumber,
  cleanPhone,
  isValidPhone,
  isValidEmail,
} = require('../utils/helpers');

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];

// Turns any value into a trimmed string (protects against objects/arrays in the body)
const toText = (value) => (typeof value === 'string' ? value.trim() : '');

// The details a customer is allowed to see about their order
function toCustomerView(order) {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    gst: order.gst,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    status: order.status,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// @route  POST /api/orders
// @access Public
async function createOrder(req, res, next) {
  try {
    const customerName = toText(req.body.customerName);
    const customerEmail = toText(req.body.customerEmail).toLowerCase();
    const customerPhone = cleanPhone(toText(req.body.customerPhone));
    const deliveryAddress = toText(req.body.deliveryAddress);
    const notes = toText(req.body.notes).slice(0, 300);
    const paymentMethod = toText(req.body.paymentMethod) || 'cod';
    const cartItems = req.body.items;

    // 1. Check the customer details
    if (customerName.length < 2) {
      return res.status(400).json({ message: 'Please enter your name' });
    }
    if (!isValidPhone(customerPhone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    }
    if (customerEmail && !isValidEmail(customerEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (deliveryAddress.length < 10) {
      return res.status(400).json({ message: 'Please enter your full delivery address' });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Please choose a valid payment method' });
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. Load the real items from the database.
    //    We never trust the price sent by the browser - we always use the price from MongoDB.
    const ids = cartItems.map((item) => item.menuItemId);
    if (!ids.every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: 'Your cart has an invalid item' });
    }

    const menuItems = await MenuItem.find({ _id: { $in: ids } }).lean();

    const orderItems = [];
    for (const cartItem of cartItems) {
      const menuItem = menuItems.find((m) => m._id.toString() === String(cartItem.menuItemId));
      const quantity = Number(cartItem.quantity);

      if (!menuItem) {
        return res.status(400).json({ message: 'An item in your cart is no longer on the menu' });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is sold out right now` });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ message: 'Quantity must be between 1 and 20' });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        image: menuItem.image,
        price: menuItem.price,
        quantity,
      });
    }

    // 3. Work out the bill (subtotal + delivery + GST)
    const bill = calculateBill(orderItems);

    // 4. Save the order
    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      notes,
      paymentMethod,
      items: orderItems,
      ...bill,
      status: 'pending',
      statusHistory: [{ status: 'pending' }],
    });

    res.status(201).json({ message: 'Order placed successfully', order: toCustomerView(order) });
  } catch (error) {
    next(error);
  }
}

// @route  GET /api/orders/track/:orderNumber?phone=9876543210
// @access Public (the phone number must match, so strangers can't see your order)
async function trackOrder(req, res, next) {
  try {
    const orderNumber = toText(req.params.orderNumber).toUpperCase();
    const phone = cleanPhone(toText(req.query.phone));

    if (!orderNumber || !isValidPhone(phone)) {
      return res.status(400).json({ message: 'Enter your order number and the phone number used for the order' });
    }

    const order = await Order.findOne({ orderNumber, customerPhone: phone }).lean();

    if (!order) {
      return res.status(404).json({ message: 'No order found with this order number and phone number' });
    }

    res.json({ order: toCustomerView(order) });
  } catch (error) {
    next(error);
  }
}

// @route  GET /api/orders?status=pending&page=1&limit=20
// @access Admin
async function getOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const status = toText(req.query.status);

    const filter = {};
    if (status === 'active') filter.status = { $in: ACTIVE_STATUSES };
    else if (ORDER_STATUSES.includes(status)) filter.status = status;

    // Run both queries at the same time to save time
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-__v')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, page, totalPages: Math.ceil(total / limit) || 1, total });
  } catch (error) {
    next(error);
  }
}

// @route  GET /api/orders/stats
// @access Admin
async function getOrderStats(req, res, next) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, activeOrders, todayRevenue, byStatus, unreadMessages] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        Order.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
        // Add up today's order totals (cancelled orders don't count)
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        // Count how many orders are in each status
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Message.countDocuments({ isRead: false }),
      ]);

    const statusCounts = {};
    byStatus.forEach((row) => {
      statusCounts[row._id] = row.count;
    });

    res.json({
      stats: {
        totalOrders,
        todayOrders,
        activeOrders,
        todayRevenue: todayRevenue[0] ? todayRevenue[0].total : 0,
        statusCounts,
        unreadMessages,
      },
    });
  } catch (error) {
    next(error);
  }
}

// @route  PATCH /api/orders/:id/status   body: { status: "preparing" }
// @access Admin
async function updateOrderStatus(req, res, next) {
  try {
    const status = toText(req.body.status);

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== status) {
      order.status = status;
      order.statusHistory.push({ status });
      await order.save();
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, trackOrder, getOrders, getOrderStats, updateOrderStatus };
