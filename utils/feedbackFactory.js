// utils/feedbackFactory.js
/**
 * @fileoverview Factory Pattern: creates standardized feedback objects.
 * Ensures consistent data structure before database persistence.
 */

/**
 * @function createFeedback
 * @description Builds a standardized feedback object before database save.
 * @param {String} userId - MongoDB user ID
 * @param {String} customerName - Name of customer providing feedback
 * @param {String} customerEmail - Customer email
 * @param {Number} rating - Rating from 0-10
 * @param {String} comment - Feedback comment
 * @param {String} reservationId - Optional linked reservation ID
 * @returns {Object} Feedback object ready for database insertion
 */
function createFeedback(
  userId,
  customerName,
  customerEmail,
  rating,
  comment,
  reservationId = null
) {
  return {
    userId,
    customerName,
    customerEmail,
    rating,
    comment,
    reservationId
  };
}

/**
 * @function makeFeedbackDTO
 * @description Data Transfer Object - returns safe feedback data for API response.
 * @param {Object} feedbackDoc - Mongoose feedback document
 * @returns {Object} Cleaned feedback object
 */
function makeFeedbackDTO(feedbackDoc) {
  return {
    id: String(feedbackDoc._id),
    userId: String(feedbackDoc.userId),
    customerName: feedbackDoc.customerName,
    customerEmail: feedbackDoc.customerEmail,
    rating: feedbackDoc.rating,
    comment: feedbackDoc.comment,
    reservationId: feedbackDoc.reservationId ? String(feedbackDoc.reservationId) : null,
    adminResponse: feedbackDoc.adminResponse || null,
    createdAt: feedbackDoc.createdAt,
    updatedAt: feedbackDoc.updatedAt
  };
}

module.exports = {
  createFeedback,
  makeFeedbackDTO
};
