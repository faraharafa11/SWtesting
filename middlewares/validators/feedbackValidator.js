const { body } = require("express-validator");

const createFeedbackValidator = [
    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("comment")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Comment must not exceed 1000 characters"),

    body("reservationId")
        .optional()
        .isMongoId()
        .withMessage("Invalid reservation ID format")
];

module.exports = {
    createFeedbackValidator
};

