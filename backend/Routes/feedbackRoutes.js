// routes/feedbackRoutes.js
/**
 * @fileoverview Feedback routes for customer reviews and ratings.
 * Implements FR5 - feedback submission, management, and analytics.
 */

const express = require('express');
const router = express.Router();
const feedbackController = require('../Controller/feedbackController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const {
  createFeedbackValidators,
  updateFeedbackValidators,
  idValidators,
  listFeedbackValidators
} = require('../middlewares/validators/feedbackValidators');

// User routes (private)
router.post('/feedback', verifyToken, createFeedbackValidators, feedbackController.submitFeedback);
router.get('/feedback/my-feedback', verifyToken, listFeedbackValidators, feedbackController.getUserFeedback);
router.get('/feedback/:id', verifyToken, idValidators, feedbackController.getFeedbackById);

// Admin routes
router.get('/admin/feedback', verifyToken, requireAdmin, listFeedbackValidators, feedbackController.getAllFeedback);
router.delete('/admin/feedback/:id', verifyToken, requireAdmin, idValidators, feedbackController.deleteFeedback);

module.exports = router;
