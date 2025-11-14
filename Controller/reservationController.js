const Reservation = require("../Model/Reservation");
const { validationResult } = require("express-validator");
const { reservationResponseDTO } = require("../utils/reservationFactory");

// Helper: check table availability
const isTableAvailable = async (tableNo, date, time) => {
    const reserved = await Reservation.findOne({
        tableNo,
        date,
        time,
        status: "booked"
    });
    return !reserved;
};

// CREATE RESERVATION
const createReservation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { tableNo, date, time, guests } = req.body;

        // Check availability
        const free = await isTableAvailable(tableNo, date, time);
        if (!free) {
            return res.status(400).json({ message: "Table not available" });
        }

        const reservation = await Reservation.create({
            userId: req.user.id,
            tableNo,
            date,
            time,
            guests
        });

        return res.status(201).json(reservationResponseDTO(reservation));

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET USER RESERVATIONS
const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ userId: req.user.id });
        return res.json(reservations.map(reservationResponseDTO));
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

// CANCEL RESERVATION
const cancelReservation = async (req, res) => {
    try {
        const updated = await Reservation.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status: "cancelled" },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        return res.json(reservationResponseDTO(updated));

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    cancelReservation
};
