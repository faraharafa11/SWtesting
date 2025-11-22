// Model/Reservation.js
/**
 * @fileoverview Reservation model schema for table bookings.
 * Implements FR3 and FR4 - table reservations with status tracking.
 * Uses SOLID principles: Single Responsibility (booking management only).
 */

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  tableNumber: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  reservationDate: {
    type: Date,
    required: true,
    index: true
  },
  reservationTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

reservationSchema.index({ tableNumber: 1, reservationDate: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
