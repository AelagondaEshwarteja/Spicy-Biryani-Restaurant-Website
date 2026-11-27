// All the money rules live in one place so they are easy to change.
// The frontend shows the same rules, but the backend is the one that decides the final bill.

const FREE_DELIVERY_ABOVE = 499; // orders of ₹499 or more get free delivery
const DELIVERY_FEE = 40;
const GST_RATE = 0.05; // 5% GST on restaurant food in India

function calculateBill(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const gst = Math.round(subtotal * GST_RATE);
  const totalAmount = subtotal + deliveryFee + gst;

  return { subtotal, deliveryFee, gst, totalAmount };
}

module.exports = { calculateBill, FREE_DELIVERY_ABOVE, DELIVERY_FEE, GST_RATE };
