// middlewares/validators/feedbackValidators.js
/**
 * @fileoverview Express-validator rules for feedback endpoints.
 * Implements declarative validation for feedback system (FR5).
 */

const { body, param, query } = require('express-validator');

/**
 * @desc Validation rules for creating feedback
 */
const createFeedbackValidators = [
  body('customerName')
    .isString().withMessage('Customer name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Customer name must be 2-50 characters'),

  body('customerEmail')
    .isEmail().withMessage('Invalid email address'),

  body('rating')
    .isInt({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),

  body('comment')
    .isString().withMessage('Comment must be a string')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),

  body('reservationId')
    .optional()
    .isMongoId().withMessage('Invalid reservation ID'),

];

/**
 * @desc Validation rules for updating feedback (admin only)
 */
const updateFeedbackValidators = [
  param('id')
    .isMongoId().withMessage('Invalid feedback ID'),

  body('adminResponse')
    .optional()
    .isString().withMessage('Admin response must be a string')
    .isLength({ max: 500 }).withMessage('Response must be less than 500 characters'),

];

/**
 * @desc Validation for feedback ID parameter
 */
const idValidators = [
  param('id')
    .isMongoId().withMessage('Invalid feedback ID')
];

/**
 * @desc Validation for query parameters in listing
 */
const listFeedbackValidators = [

  query('minRating')
    .optional()
    .isInt({ min: 0, max: 10 }).withMessage('minRating must be between 0 and 10'),
];

module.exports = {
  createFeedbackValidators,
  updateFeedbackValidators,
  idValidators,
  listFeedbackValidators
};
