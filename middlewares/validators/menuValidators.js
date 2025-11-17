// validators/menuValidator.js
/**
 * @fileoverview Contains declarative validation rules for Menu routes.
 * Ensures valid input when adding or updating menu items.
 */

const { body, param } = require('express-validator');

/**
 * @desc Validation for adding a new menu item (Admin)
 * @returns {Array} express-validator rules
 */
const addMenuValidators = [
  body('name')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

  body('category')
    .isString().withMessage('Category must be a string')
    .notEmpty().withMessage('Category is required'),

  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
];

/**
 * @desc Validation for updating an existing menu item (Admin)
 * @returns {Array} express-validator rules
 */
const updateMenuValidators = [
  param('id')
    .isMongoId().withMessage('Invalid menu item ID'),

  body('name')
    .optional()
    .isString().withMessage('Name must be a string'),

  body('category')
    .optional()
    .isString().withMessage('Category must be a string'),

  body('price')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
];

/**
 * @desc Validation for deleting a menu item (Admin)
 * @returns {Array} express-validator rules
 */
const deleteMenuValidators = [
  param('id')
    .isMongoId().withMessage('Invalid menu item ID')
];

module.exports = { addMenuValidators, updateMenuValidators, deleteMenuValidators };
