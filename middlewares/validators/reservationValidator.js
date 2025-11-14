const { body } = require("express-validator");

const createReservationValidator = [
    body("tableNo")
        .isInt({ min: 1 })
        .withMessage("Table number is required"),

    body("date")
        .notEmpty()
        .withMessage("Date is required"),

    body("time")
        .notEmpty()
        .withMessage("Time is required"),

    body("guests")
        .isInt({ min: 1 })
        .withMessage("Guests must be at least 1")
];

module.exports = {
    createReservationValidator
};
