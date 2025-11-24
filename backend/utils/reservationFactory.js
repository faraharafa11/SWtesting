// utils/reservationFactory.js
/**
 * @fileoverview Factory Pattern: creates standardized reservation objects.
 * Separates object construction from business logic (Dependency Injection).
 */

/**
 * @function createReservation
 * @description Builds a standardized reservation object before database save.
 * @param {String} userId - MongoDB user ID
 * @param {String} customerName - Name of customer making reservation
 * @param {String} customerEmail - Customer email
 * @param {String} customerPhone - Customer phone number
 * @param {Number} tableNumber - Table number to reserve
 * @param {Number} guestCount - Number of guests
 * @param {Date} reservationDate - Date of reservation
 * @param {String} reservationTime - Time of reservation (HH:MM)
 * @param {String} specialRequests - Optional special requests
 * @returns {Object} Reservation object ready for database insertion
 */
function createReservation(
  userId,
  customerName,
  customerEmail,
  customerPhone,
  tableNumber,
  guestCount,
  reservationDate,
  reservationTime,
  specialRequests = ''
) {
  return {
    userId,
    customerName,
    customerEmail,
    customerPhone,
    tableNumber,
    guestCount,
    reservationDate,
    reservationTime,
    status: 'pending',
    specialRequests
  };
}

/**
 * @function makeReservationDTO
 * @description Data Transfer Object - returns safe reservation data for API response.
 * @param {Object} reservationDoc - Mongoose reservation document
 * @returns {Object} Cleaned reservation object without sensitive data
 */
function makeReservationDTO(reservationDoc) {
  return {
    id: String(reservationDoc._id),
    userId: String(reservationDoc.userId),
    customerName: reservationDoc.customerName,
    customerEmail: reservationDoc.customerEmail,
    customerPhone: reservationDoc.customerPhone,
    tableNumber: reservationDoc.tableNumber,
    guestCount: reservationDoc.guestCount,
    reservationDate: reservationDoc.reservationDate,
    reservationTime: reservationDoc.reservationTime,
    status: reservationDoc.status,
    specialRequests: reservationDoc.specialRequests,
    createdAt: reservationDoc.createdAt,
    updatedAt: reservationDoc.updatedAt
  };
}

module.exports = {
  createReservation,
  makeReservationDTO
};
