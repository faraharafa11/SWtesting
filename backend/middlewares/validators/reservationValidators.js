// middlewares/validators/reservationValidators.js
/**
 * @fileoverview Express-validator rules for reservation endpoints.
 * Implements declarative validation for booking system (FR3).
 */

const { body, param, query } = require('express-validator');

/**
 * @desc Validation rules for creating a new reservation
 * Ensures valid booking data before database operations
 */
const createReservationValidators = [
  body('customerName')
    .isString().withMessage('Customer name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Customer name must be 2-50 characters'),

  body('customerEmail')
    .isEmail().withMessage('Invalid email address'),

  body('customerPhone')
    .isMobilePhone().withMessage('Invalid phone number'),

  body('tableNumber')
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer'),

  body('guestCount')
    .isInt({ min: 1, max: 12 }).withMessage('Guest count must be between 1 and 12'),

  body('specialRequests')
    .optional()
    .isString().withMessage('Special requests must be a string')
    .isLength({ max: 500 }).withMessage('Special requests must be less than 500 characters')
];

/**
 * @desc Validation rules for updating a reservation
 */
const updateReservationValidators = [
  param('id')
    .isMongoId().withMessage('Invalid reservation ID'),

  body('customerName')
    .optional()
    .isString().withMessage('Customer name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Customer name must be 2-50 characters'),

  body('customerEmail')
    .optional()
    .isEmail().withMessage('Invalid email address'),

  body('customerPhone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number'),

  body('tableNumber')
    .optional()
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer'),

  body('guestCount')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Guest count must be between 1 and 12'),

  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled'])
    .withMessage('Status must be pending, confirmed, or cancelled'),

  body('specialRequests')
    .optional()
    .isString().withMessage('Special requests must be a string')
];

/**
 * @desc Validation for reservation ID parameter
 */
const idValidators = [
  param('id')
    .isMongoId().withMessage('Invalid reservation ID')
];

/**
 * @desc Validation for query parameters in listing
 */
const listReservationValidators = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled'])
    .withMessage('Invalid status filter'),
];

module.exports = {
  createReservationValidators,
  updateReservationValidators,
  idValidators,
  listReservationValidators
};
