// Entry point of the backend.
// It loads the .env file, connects to MongoDB, sets up Express and starts the server.

require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const compression = require('compression');

const connectDB = require('./config/db');
const { seedDatabase } = require('./seed/seed');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
// Only allow our own frontend to call this API from the browser
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(cors({ origin: allowedOrigins }));

// gzip every response so the data is smaller and loads faster
app.use(compression());

// Read JSON request bodies (with a size limit so nobody can send huge payloads)
app.use(express.json({ limit: '100kb' }));

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/nutrition', nutritionRoutes);

// ---------- Error handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
async function startServer() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Add it to backend/.env (see .env.example).');
    process.exit(1);
  }

  await connectDB();

  // Adds the default menu and admin account the first time the app runs.
  // If this fails (e.g. ADMIN_PASSWORD is too short) we still start the API and show why.
  try {
    await seedDatabase({ reset: false });
  } catch (error) {
    console.error(`Could not add default data: ${error.message}`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
