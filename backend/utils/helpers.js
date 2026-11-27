const Order = require('../models/Order');

// Makes an order number like "SB-251127-4821" (SB + date + 4 random digits).
// We check the database so two orders never get the same number.
async function generateOrderNumber() {
  const today = new Date();
  const datePart =
    String(today.getFullYear()).slice(-2) +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  let orderNumber;
  let alreadyUsed = true;

  while (alreadyUsed) {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    orderNumber = `SB-${datePart}-${randomPart}`;
    alreadyUsed = await Order.exists({ orderNumber });
  }

  return orderNumber;
}

// Keeps only the digits of an Indian mobile number: "+91 98765-43210" -> "9876543210"
function cleanPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Stops special characters like "(" from breaking a search regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { generateOrderNumber, cleanPhone, isValidPhone, isValidEmail, escapeRegex };
