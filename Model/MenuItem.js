// models/MenuItem.js
/**
 * @fileoverview Menu item schema for restaurant system.
 * Implements NFR1 (Performance) using indexes and .lean().
 */

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
