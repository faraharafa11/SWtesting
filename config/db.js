// config/db.js
/**
 * @fileoverview Database configuration file for MongoDB connection.
 * Handles connection initialization and logs success or failure messages.
 */

const mongoose = require('mongoose');

/**
 * @function connectDB
 * @description Connects to MongoDB using environment variables.
 * Terminates the app if connection fails.
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/restaurantDB');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
