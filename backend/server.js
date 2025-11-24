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

// Connect database
connectDB();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
