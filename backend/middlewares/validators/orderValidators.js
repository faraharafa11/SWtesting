// middlewares/validators/orderValidators.js
/**
 * @fileoverview Express-validator rules for order endpoints.
 * Implements declarative validation for order management (FR6).
 */

const { body, param, query } = require('express-validator');

/**
 * @desc Validation rules for creating an order
 */
const createOrderValidators = [
  body('tableNumber')
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer'),

  body('items')
    .isArray({ min: 1 }).withMessage('Items must be a non-empty array'),

  body('items.*.menuItemId')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('items.*.itemName')
    .isString().withMessage('Item name must be a string')
    .isLength({ min: 1 }).withMessage('Item name is required'),

  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('items.*.price')
    .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),

  body('items.*.specialInstructions')
    .optional()
    .isString().withMessage('Special instructions must be a string'),

  body('subtotal')
    .isFloat({ gt: 0 }).withMessage('Subtotal must be greater than 0'),

  body('tax')
    .optional()
    .isFloat({ min: 0 }).withMessage('Tax cannot be negative'),

  body('discount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Discount cannot be negative'),

  body('total')
    .isFloat({ gt: 0 }).withMessage('Total must be greater than 0'),

  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'apple pay'])
    .withMessage('Invalid payment method'),

  body('specialRequests')
    .optional()
    .isString().withMessage('Special requests must be a string'),

  body('reservationId')
    .optional()
    .isMongoId().withMessage('Invalid reservation ID')
];

/**
 * @desc Validation rules for updating order status
 */
const updateOrderValidators = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'preparing', 'ready','cancelled'])
    .withMessage('Invalid order status'),

  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status')
];

/**
 * @desc Validation for order ID parameter
 */
const idValidators = [
  param('id')
    .isMongoId().withMessage('Invalid order ID')
];

/**
 * @desc Validation for query parameters in listing
 */
const listOrderValidators = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'preparing', 'ready','cancelled'])
    .withMessage('Invalid status filter'),

  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status filter'),

  query('tableNumber')
    .optional()
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
];

module.exports = {
  createOrderValidators,
  updateOrderValidators,
  idValidators,
  listOrderValidators
};
