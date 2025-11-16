// server.js
/**
 * @fileoverview Application entry point.
 * Initializes environment, connects database, registers routes & middlewares.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const authRoutes = require('./Routes/authRoutes');
const menuRoutes = require('./Routes/menuRoutes');
const reservationRoutes = require('./Routes/reservationRoutes'); //  added reservation routes
const feedbackRoutes = require('./Routes/feedbackRoutes'); //  added feedback routes

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Connect database
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api', menuRoutes);
app.use('/api/reservations', reservationRoutes); // ✅ Registered reservation routes
app.use('/api/feedback', feedbackRoutes); // ✅ Registered feedback routes

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

