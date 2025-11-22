// controllers/menuController.js
const { validationResult } = require('express-validator');
const MenuItem = require('../Model/MenuItem');
const { createMenuItem } = require('../utils/menuFactory');

/**
 * @desc Get all menu items (public)
 * @route GET /api/menu
 */
exports.getAllMenuItems = async (req, res) => {
  try {
    console.time('MenuLoad');
    const items = await MenuItem.find().lean();
    console.timeEnd('MenuLoad');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Add a menu item (admin)
 * @route POST /api/admin/menu
 */
exports.addMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, category, price } = req.body;
    const data = createMenuItem(name, category, price);
    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * @desc Update menu item (admin)
 * @route PUT /api/admin/menu/:id
 */
exports.updateMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * @desc Delete menu item (admin)
 * @route DELETE /api/admin/menu/:id
 */
exports.deleteMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
