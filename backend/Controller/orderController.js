// controllers/orderController.js
/**
 * @fileoverview Order controller for food order management.
 * Implements FR6 - order creation, tracking, and fulfillment.
 * Uses Factory Pattern for object creation and DTO for API responses.
 */

const { validationResult } = require('express-validator');
const Order = require('../Model/Order');
const MenuItem = require('../Model/MenuItem');
const { createOrder, makeOrderDTO, generateOrderNumber } = require('../utils/orderFactory');

/**
 * @desc Create a new order (FR6)
 * @route POST /api/orders
 * @access Private (User)
 * @param {Object} req.body - Order data
 * @param {Number} req.body.tableNumber - Table number
 * @param {Array} req.body.items - Array of menu items with quantities
 * @param {Number} req.body.subtotal - Order subtotal
 * @param {Number} req.body.total - Order total
 * @param {String} req.body.paymentMethod - Payment method
 * @param {String} req.body.specialRequests - Optional special requests
 * @param {String} req.body.reservationId - Optional linked reservation
 * @returns {Object} Created order with status 201
 */
async function createOrder_(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      tableNumber,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      specialRequests,
      reservationId
    } = req.body;

    // Validate items exist and have correct prices
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId).lean();
      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item ${item.itemName} not found`
        });
      }
    }

    const orderData = createOrder(
      req.user.id,
      tableNumber,
      items,
      subtotal,
      total,
      paymentMethod,
      specialRequests,
      reservationId,
      tax || 0,
      discount || 0
    );

    const order = await Order.create(orderData);
    res.status(201).json({
      message: 'Order created successfully',
      order: makeOrderDTO(order)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get orders for logged-in user
 * @route GET /api/orders
 * @access Private (User)
 * @returns {Array} User's orders with pagination
 */
async function getUserOrders(req, res) {
  try {
    const { status} = req.query;

    const filter = { userId: req.user.id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      orders: orders.map(makeOrderDTO),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 * @returns {Object} Order details
 */
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('preparedBy', 'name email')
      .populate('servedBy', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && String(order.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({ order: makeOrderDTO(order) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get all orders for a specific table (Real-time updates)
 * @route GET /api/orders/table/:tableNumber
 * @access Private (Staff/Admin)
 * @returns {Array} All pending/active orders for table
 */
async function getTableOrders(req, res) {
  try {
    const { tableNumber } = req.params;

    const orders = await Order.find({
      tableNumber: Number(tableNumber),
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      tableNumber: Number(tableNumber),
      orders: orders.map(makeOrderDTO)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Update order status (Admin/Staff only)
 * @route PUT /api/admin/orders/:id/status
 * @access Private (Admin/Staff)
 * @param {String} req.body.status - New order status
 * @param {String} req.body.preparedBy - User ID of preparer (optional)
 * @param {String} req.body.servedBy - User ID of server (optional)
 * @returns {Object} Updated order
 */
async function updateOrderStatus(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, preparedBy, servedBy } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    order.status = status;

    await order.save();

    res.json({
      message: `Order status updated to ${status}`,
      order: makeOrderDTO(order)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Update payment status (Admin/Staff only)
 * @route PUT /api/admin/orders/:id/payment
 * @access Private (Admin/Staff)
 * @param {String} req.body.paymentStatus - New payment status
 * @param {String} req.body.paymentMethod - Payment method
 * @returns {Object} Updated order
 */
async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus, paymentMethod: paymentMethod || undefined },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Payment status updated',
      order: makeOrderDTO(order)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get all orders (Admin only)
 * @route GET /api/admin/orders
 * @access Private (Admin)
 * @returns {Array} All orders with pagination
 */
async function getAllOrders(req, res) {
  try {
    const { status, paymentStatus, tableNumber} = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (tableNumber) filter.tableNumber = Number(tableNumber);

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      orders: orders.map(makeOrderDTO),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Cancel order (Admin/User own order)
 * @route PUT /api/admin/orders/:id/cancel
 * @access Private
 * @returns {Object} Cancelled order
 */
async function cancelOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && String(order.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (['preparing', 'ready', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order: makeOrderDTO(order)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createOrder: createOrder_,
  getUserOrders,
  getOrderById,
  getTableOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  cancelOrder,
};
