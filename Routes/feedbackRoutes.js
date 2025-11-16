const express = require("express");
const router = express.Router();

const { verifyToken, requireAdmin } = require("../middlewares/authMiddleware");
const { createFeedbackValidator } = require("../middlewares/validators/feedbackValidator");
const {
    createFeedback,
    getAllFeedback,
    getMyFeedback
} = require("../Controller/feedbackController");

// Create feedback (authenticated users)
router.post("/", verifyToken, createFeedbackValidator, createFeedback);

// Get all feedback (admin only)
router.get("/", verifyToken, requireAdmin, getAllFeedback);

// Get user's own feedback
router.get("/my", verifyToken, getMyFeedback);

module.exports = router;

