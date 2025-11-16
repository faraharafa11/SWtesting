const Feedback = require("../Model/Feedback");
const { validationResult } = require("express-validator");
const { feedbackResponseDTO } = require("../utils/feedbackFactory");

// CREATE FEEDBACK
const createFeedback = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { rating, comment, reservationId } = req.body;

        const feedback = await Feedback.create({
            userId: req.user.id,
            rating,
            comment: comment || null,
            reservationId: reservationId || null
        });

        return res.status(201).json(feedbackResponseDTO(feedback));

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET ALL FEEDBACK (Admin only)
const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
        return res.json(feedbacks.map(feedbackResponseDTO));
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

// GET USER'S FEEDBACK
const getMyFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json(feedbacks.map(feedbackResponseDTO));
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createFeedback,
    getAllFeedback,
    getMyFeedback
};

