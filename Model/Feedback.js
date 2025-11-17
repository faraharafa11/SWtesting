// Model/Feedback.js
/**
 * @fileoverview Feedback model schema for customer reviews and ratings.
 * Implements FR5 - customer feedback collection and management.
 * Uses SOLID principles: Single Responsibility (feedback storage only).
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: false
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
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  adminResponse: {
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

feedbackSchema.index({ category: 1, rating: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
