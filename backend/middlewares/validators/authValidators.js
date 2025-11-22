// middlewares/validators/authValidators.js
/**
 * @fileoverview Express-validator rules for authentication endpoints.
 * Moves validation logic outside the controller for cleaner design.
 */

const { body } = require('express-validator');

/**
 * @desc Validation rules for user registration.
 * Ensures valid name, email, password, and optional role.
 */
const registerValidators = [
  body('name')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

  body('email')
    .isEmail().withMessage('Invalid email address'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be user or admin')
];

/**
 * @desc Validation rules for login.
 */
const loginValidators = [
  body('email')
    .isEmail().withMessage('Invalid email address'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

module.exports = {
  registerValidators,
  loginValidators
};
