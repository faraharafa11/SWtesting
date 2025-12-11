// server.js
/**
 * @fileoverview Application entry point.
 * Initializes environment, connects database, registers routes & middlewares.
 * Implements all FR1-FR6 features with proper separation of concerns.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');

// Import all routes
const authRoutes = require('./Routes/authRoutes');
const menuRoutes = require('./Routes/menuRoutes');
const reservationRoutes = require('./Routes/reservationRoutes');
const feedbackRoutes = require('./Routes/feedbackRoutes');
const orderRoutes = require('./Routes/orderRoutes');

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Routes - Organized by feature
app.use('/api', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', reservationRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Import Order model
const Order = require('./Model/Order');

// Connect database and start timer after connection
async function startServer() {
  try {
    await connectDB();
    console.log('Database connected. Starting order status auto-transition timer...');
    
    // Start order status auto-transition timer (runs every 2 seconds)
    console.log('✅ Order status auto-transition timer started (checks every 2 seconds)');
    
    // Run immediately first time, then every 2 seconds
    const runTimer = async () => {
      try {
        const now = new Date();
        const twentySecondsAgo = new Date(now.getTime() - 20000);
        const fortySecondsAgo = new Date(now.getTime() - 40000);

        // Check what orders exist
        const pendingOrders = await Order.find({ status: 'pending' }).select('orderNumber createdAt').lean();
        const confirmedOrders = await Order.find({ status: 'confirmed' }).select('orderNumber createdAt').lean();
        
        if (pendingOrders.length > 0 || confirmedOrders.length > 0) {
          console.log(`[Timer ${now.toLocaleTimeString()}] Checking ${pendingOrders.length} pending, ${confirmedOrders.length} confirmed orders`);
          
          pendingOrders.forEach(order => {
            const age = Math.floor((now - new Date(order.createdAt)) / 1000);
            console.log(`  - Pending order ${order.orderNumber}: ${age} seconds old`);
          });
        }

        // pending -> confirmed after 20 seconds
        const confirmedResult = await Order.updateMany(
          { status: 'pending', createdAt: { $lte: twentySecondsAgo } },
          { $set: { status: 'confirmed', updatedAt: now } }
        );

        // confirmed -> preparing after 40 seconds total
        const preparingResult = await Order.updateMany(
          { status: 'confirmed', createdAt: { $lte: fortySecondsAgo } },
          { $set: { status: 'preparing', updatedAt: now } }
        );

        if (confirmedResult.modifiedCount > 0 || preparingResult.modifiedCount > 0) {
          console.log(`[Timer ${now.toLocaleTimeString()}] ✅ Updated ${confirmedResult.modifiedCount} to confirmed, ${preparingResult.modifiedCount} to preparing`);
        }
      } catch (error) {
        console.error('[Timer] ❌ Error:', error.message, error.stack);
      }
    };
    
    // Run immediately, then every 2 seconds
    runTimer();
    setInterval(runTimer, 2000);
    
    // Start the server after everything is set up
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
