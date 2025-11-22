// controllers/reservationController.js
/**
 * @fileoverview Reservation controller for table booking management.
 * Implements FR3 and FR4 - user reservations and admin management.
 * Uses Factory Pattern for object creation and DTO for API responses.
 */

const { validationResult } = require('express-validator');
const Reservation = require('../Model/Reservation');
const User = require('../Model/User');
const { createReservation, makeReservationDTO } = require('../utils/reservationFactory');

/**
 * @desc Create a new reservation (FR3)
 * @route POST /api/reservations
 * @access Private (User)
 * @param {Object} req - Express request object
 * @param {String} req.body.customerName - Customer name
 * @param {String} req.body.customerEmail - Customer email
 * @param {String} req.body.customerPhone - Customer phone
 * @param {Number} req.body.tableNumber - Table number
 * @param {Number} req.body.guestCount - Number of guests
 * @param {Date} req.body.reservationDate - Reservation date
 * @param {String} req.body.reservationTime - Reservation time (HH:MM)
 * @param {String} req.body.specialRequests - Optional special requests
 * @returns {Object} Created reservation with status 201
 */
async function createReservation_(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      tableNumber,
      guestCount,
      reservationDate,
      reservationTime,
      specialRequests
    } = req.body;

    // Check if table is already booked at this time
    const existingReservation = await Reservation.findOne({
      tableNumber,
      reservationDate,
      reservationTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingReservation) {
      return res.status(409).json({
        message: 'This table is already reserved for this time slot'
      });
    }

    const reservationData = createReservation(
      req.user.id,
      customerName,
      customerEmail,
      customerPhone,
      tableNumber,
      guestCount,
      reservationDate,
      reservationTime,
      specialRequests
    );

    const reservation = await Reservation.create(reservationData);
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: makeReservationDTO(reservation)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get all reservations for logged-in user (FR3)
 * @route GET /api/reservations
 * @access Private (User)
 * @returns {Array} Array of user's reservations
 */
async function getUserReservations(req, res) {
  try {
    const { status} = req.query;

    const filter = { userId: req.user.id };
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter)
      .sort({ reservationDate: -1 })
      .lean();

    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations: reservations.map(makeReservationDTO),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get reservation by ID
 * @route GET /api/reservations/:id
 * @access Private
 * @returns {Object} Reservation details
 */
async function getReservationById(req, res) {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization - user can only view their own reservations
    if (req.user.role === 'user' && String(reservation.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({ reservation: makeReservationDTO(reservation) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Update reservation details
 * @route PUT /api/reservations/:id
 * @access Private (User - own reservation, Admin)
 * @returns {Object} Updated reservation
 */
async function updateReservation(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && String(reservation.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const allowedUpdates = ['customerName', 'customerEmail', 'customerPhone', 'tableNumber', 'guestCount', 'reservationDate', 'reservationTime', 'duration', 'specialRequests', 'status'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        reservation[key] = req.body[key];
      }
    });

    reservation.updatedAt = new Date();
    await reservation.save();

    res.json({
      message: 'Reservation updated successfully',
      reservation: makeReservationDTO(reservation)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Cancel reservation (FR4)
 * @route DELETE /api/reservations/:id
 * @access Private
 * @returns {Object} Cancellation confirmation
 */
async function cancelReservation(req, res) {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && String(reservation.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      message: 'Reservation cancelled successfully',
      reservation: makeReservationDTO(reservation)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get all reservations (Admin only) (FR4)
 * @route GET /api/admin/reservations
 * @access Private (Admin)
 * @returns {Array} All reservations with pagination
 */
async function getAllReservations(req, res) {
  try {
    const { status, date} = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.reservationDate = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(filter)
      .populate('userId', 'name email')
      .sort({ reservationDate: -1 })
      .lean();

    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations: reservations.map(makeReservationDTO),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Update reservation status (Admin only)
 * @route PUT /api/admin/reservations/:id/status
 * @access Private (Admin)
 * @param {String} req.body.status - New status
 * @returns {Object} Updated reservation
 */
async function updateReservationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json({
      message: 'Reservation status updated',
      reservation: makeReservationDTO(reservation)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * @desc Get available tables for a specific date and time
 * @route GET /api/reservations/available-tables
 * @access Public
 * @param {Date} req.query.date - Reservation date
 * @param {String} req.query.time - Reservation time (HH:MM)
 * @returns {Array} Available table numbers
 */
async function getAvailableTables(req, res) {
  try {
    const { date, time, guestCount = 2 } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required' });
    }

    // Get all booked tables for this date/time
    const bookedTables = await Reservation.distinct('tableNumber', {
      reservationDate: new Date(date),
      reservationTime: time,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Return available table numbers (assuming tables 1-20)
    const totalTables = 20;
    const availableTables = [];
    for (let i = 1; i <= totalTables; i++) {
      if (!bookedTables.includes(i)) {
        availableTables.push(i);
      }
    }

    res.json({ availableTables });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createReservation: createReservation_,
  getUserReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  getAvailableTables
};
