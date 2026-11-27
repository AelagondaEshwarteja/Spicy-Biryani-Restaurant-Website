const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const PAYMENT_METHODS = ['cod', 'upi', 'card'];

// One line in the order, e.g. "2 x Chicken Dum Biryani at ₹299".
// We copy the name and price so old orders stay correct even if the menu changes later.
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },

    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    gst: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'cod' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

// The admin list filters by status and sorts by newest first
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
