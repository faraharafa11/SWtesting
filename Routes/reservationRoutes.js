const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const { createReservationValidator } = require("../middlewares/validators/reservationValidator");
const {
  createReservation,
  getMyReservations,
  cancelReservation
} = require("../Controller/reservationController");

// Create reservation
router.post("/", verifyToken, createReservationValidator, createReservation);

// Get user's reservations
router.get("/", verifyToken, getMyReservations);

// Cancel reservation
router.put("/:id/cancel", verifyToken, cancelReservation);

module.exports = router;
