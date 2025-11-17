// controllers/feedbackController.js
/**
 * @fileoverview Feedback controller for customer reviews and ratings.
 * Implements FR5 - feedback collection, management, and analytics.
 * Uses Factory Pattern for object creation and DTO for API responses.
 */

const { validationResult } = require('express-validator');
const Feedback = require('../Model/Feedback');
const { createFeedback, makeFeedbackDTO } = require('../utils/feedbackFactory');

/**
 * @desc Submit new feedback (FR5)
 * @route POST /api/feedback
 * @access Private (User)
 * @param {Object} req.body - Feedback data
 * @param {String} req.body.customerName - Customer name
 * @param {String} req.body.customerEmail - Customer email
 * @param {Number} req.body.rating - Rating 0-10
 * @param {String} req.body.comment - Feedback comment
 * @param {String} req.body.reservationId - Optional linked reservation
 * @returns {Object} Created feedback with status 201
 */
async function submitFeedback(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customerName,
      customerEmail,
      rating,
      category,
      comment,
      reservationId,
    } = req.body;

    const feedbackData = createFeedback(
      req.user.id,
      customerName,
      customerEmail,
      rating,
      category,
      comment,
      reservationId,
    );

    const feedback = await Feedback.create(feedbackData);
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: makeFeedbackDTO(feedback)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get feedback submitted by logged-in user
 * @route GET /api/feedback/my-feedback
 * @access Private (User)
 * @returns {Array} User's feedback entries
 */
async function getUserFeedback(req, res) {
  try {
    const { status} = req.query;

    const filter = { userId: req.user.id };
    if (status) filter.status = status;

    const feedbackList = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback: feedbackList.map(makeFeedbackDTO),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get feedback by ID
 * @route GET /api/feedback/:id
 * @access Private
 * @returns {Object} Feedback details
 */
async function getFeedbackById(req, res) {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check authorization - user can only view their own feedback or admins view all
    if (req.user.role === 'user' && String(feedback.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({ feedback: makeFeedbackDTO(feedback) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get all feedback (Admin only)
 * @route GET /api/admin/feedback
 * @access Private (Admin)
 * @returns {Array} All feedback with pagination
 */
async function getAllFeedback(req, res) {
  try {
    const { status, category, minRating} = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const feedbackList = await Feedback.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback: feedbackList.map(makeFeedbackDTO),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Delete feedback (Admin only)
 * @route DELETE /api/admin/feedback/:id
 * @access Private (Admin)
 * @returns {Object} Deletion confirmation
 */
async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  submitFeedback,
  getUserFeedback,
  getFeedbackById,
  getAllFeedback,
  deleteFeedback
};
