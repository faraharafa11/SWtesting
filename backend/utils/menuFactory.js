/**
 * @function createMenuItem
 * @description Factory Pattern: creates a new MenuItem object before saving.
 * @param {String} name
 * @param {String} category
 * @param {Number} price
 * @returns {Object} menu item data
 */
function createMenuItem(name, category, price) {
  return { name, category, price };
}
module.exports = { createMenuItem };
