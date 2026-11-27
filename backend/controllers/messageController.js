const Message = require('../models/Message');
const { isValidEmail } = require('../utils/helpers');

const toText = (value) => (typeof value === 'string' ? value.trim() : '');

// @route  POST /api/messages   body: { name, email, phone, message }
// @access Public (the contact form)
async function createMessage(req, res, next) {
  try {
    const name = toText(req.body.name);
    const email = toText(req.body.email);
    const phone = toText(req.body.phone);
    const message = toText(req.body.message);

    if (name.length < 2) return res.status(400).json({ message: 'Please enter your name' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email' });
    if (message.length < 10) {
      return res.status(400).json({ message: 'Message should be at least 10 characters' });
    }

    await Message.create({ name, email, phone, message });

    res.status(201).json({ message: 'Thanks! We will get back to you within 24 hours.' });
  } catch (error) {
    next(error);
  }
}

// @route  GET /api/messages
// @access Admin
async function getMessages(req, res, next) {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

// @route  PATCH /api/messages/:id/read
// @access Admin
async function markAsRead(req, res, next) {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ item: message });
  } catch (error) {
    next(error);
  }
}

// @route  DELETE /api/messages/:id
// @access Admin
async function deleteMessage(req, res, next) {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createMessage, getMessages, markAsRead, deleteMessage };
