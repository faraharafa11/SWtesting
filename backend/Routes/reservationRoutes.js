// routes/reservationRoutes.js
/**
 * @fileoverview Reservation routes for table booking system.
 * Implements FR3 and FR4 - reservation creation, management, and admin functions.
 */

const express = require('express');
const router = express.Router();
const reservationController = require('../Controller/reservationController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const {
  createReservationValidators,
  updateReservationValidators,
  idValidators,
  listReservationValidators
} = require('../middlewares/validators/reservationValidators');

// Public route - get available tables
router.get('/reservations/available-tables', reservationController.getAvailableTables);

// User routes (private)
router.post('/reservations', verifyToken, createReservationValidators, reservationController.createReservation);
router.get('/reservations', verifyToken, listReservationValidators, reservationController.getUserReservations);
router.get('/reservations/:id', verifyToken, idValidators, reservationController.getReservationById);
router.put('/reservations/:id', verifyToken, updateReservationValidators, reservationController.updateReservation);
router.delete('/reservations/:id', verifyToken, idValidators, reservationController.cancelReservation);

// Admin routes
router.get('/admin/reservations', verifyToken, requireAdmin, listReservationValidators, reservationController.getAllReservations);
router.put('/admin/reservations/:id/status', verifyToken, requireAdmin, idValidators, reservationController.updateReservationStatus);

module.exports = router;
