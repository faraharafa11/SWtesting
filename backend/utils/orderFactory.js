// utils/orderFactory.js
/**
 * @fileoverview Factory Pattern: creates standardized order objects.
 * Implements consistent order construction following SOLID principles.
 */

/**
 * @function generateOrderNumber
 * @description Generates unique order number with timestamp and random component.
 * @returns {String} Format: ORD-YYYYMMDD-XXXXX
 */
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${dateStr}-${random}`;
}

/**
 * @function calculateTotals
 * @description Calculates subtotal, tax, and grand total from items.
 * @param {Array} items - Array of order items with price and quantity
 * @param {Number} taxRate - Tax percentage (default: 0.1 for 10%)
 * @param {Number} discount - Discount amount (default: 0)
 * @returns {Object} {subtotal, tax, total}
 */
function calculateTotals(items, taxRate = 0.1, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.max(0, subtotal + tax - discount);
  return { subtotal, tax, total };
}

/**
 * @function createOrder
 * @description Builds a standardized order object before database save.
 * @param {String} userId - MongoDB user ID
 * @param {Number} tableNumber - Table number
 * @param {Array} items - Array of order items
 * @param {Number} subtotal - Order subtotal
 * @param {Number} total - Order total
 * @param {String} paymentMethod - Payment method (default: 'cash')
 * @param {String} specialRequests - Optional special requests
 * @param {String} reservationId - Optional linked reservation ID
 * @param {Number} tax - Tax amount (default: calculated)
 * @param {Number} discount - Discount amount (default: 0)
 * @returns {Object} Order object ready for database insertion
 */
function createOrder(
  userId,
  tableNumber,
  items,
  subtotal,
  total,
  paymentMethod = 'cash',
  specialRequests = '',
  reservationId = null,
  tax = 0,
  discount = 0
) {
  return {
    userId,
    orderNumber: generateOrderNumber(),
    tableNumber,
    items,
    subtotal,
    tax,
    discount,
    total,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod,
    specialRequests,
    reservationId
  };
}

/**
 * @function makeOrderDTO
 * @description Data Transfer Object - returns safe order data for API response.
 * @param {Object} orderDoc - Mongoose order document
 * @returns {Object} Cleaned order object
 */
function makeOrderDTO(orderDoc) {
  return {
    id: String(orderDoc._id),
    userId: String(orderDoc.userId),
    orderNumber: orderDoc.orderNumber,
    tableNumber: orderDoc.tableNumber,
    items: orderDoc.items.map(item => ({
      menuItemId: String(item.menuItemId),
      itemName: item.itemName,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.specialInstructions || null
    })),
    subtotal: orderDoc.subtotal,
    tax: orderDoc.tax,
    discount: orderDoc.discount,
    total: orderDoc.total,
    status: orderDoc.status,
    paymentStatus: orderDoc.paymentStatus,
    paymentMethod: orderDoc.paymentMethod,
    specialRequests: orderDoc.specialRequests,
    reservationId: orderDoc.reservationId ? String(orderDoc.reservationId) : null,
    createdAt: orderDoc.createdAt,
    updatedAt: orderDoc.updatedAt
  };
}

module.exports = {
  generateOrderNumber,
  calculateTotals,
  createOrder,
  makeOrderDTO
};
