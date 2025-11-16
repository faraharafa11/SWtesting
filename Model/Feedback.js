// models/Feedback.js
/**
 * @fileoverview Feedback model schema for customer ratings and comments.
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
    default: null
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

