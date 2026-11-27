const mongoose = require('mongoose');

// Connects to MongoDB using the MONGO_URI from the .env file.
// If the connection fails there is no point running the API, so we stop the app.
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is missing. Add it to backend/.env (see .env.example).');
    process.exit(1);
  }

  try {
    // The database name comes from DB_NAME, so it doesn't matter if the
    // Atlas link has a name in it or not (otherwise MongoDB would use "test")
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'spicy_biryani',
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
