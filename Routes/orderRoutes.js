// routes/orderRoutes.js
/**
 * @fileoverview Order routes for food order management.
 * Implements FR6 - order creation, fulfillment, and analytics.
 */

const express = require('express');
const router = express.Router();
const orderController = require('../Controller/orderController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const {
  createOrderValidators,
  updateOrderValidators,
  idValidators,
  listOrderValidators
} = require('../middlewares/validators/orderValidators');

// User routes (private)
router.post('/orders', verifyToken, createOrderValidators, orderController.createOrder);
router.get('/orders', verifyToken, listOrderValidators, orderController.getUserOrders);
router.get('/orders/:id', verifyToken, idValidators, orderController.getOrderById);

// Admin/Staff routes
router.get('/admin/orders/table/:tableNumber', verifyToken, orderController.getTableOrders);
router.put('/admin/orders/:id/status', verifyToken, updateOrderValidators, orderController.updateOrderStatus);
router.put('/admin/orders/:id/payment', verifyToken, idValidators, orderController.updatePaymentStatus);
router.put('/admin/orders/:id/cancel', verifyToken, idValidators, orderController.cancelOrder);
router.get('/admin/orders', verifyToken, requireAdmin, listOrderValidators, orderController.getAllOrders);

module.exports = router;
