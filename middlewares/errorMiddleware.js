// middlewares/errorMiddleware.js
/**
 * @fileoverview Centralized error-handling middleware.
 * Catches unhandled exceptions and formats responses.
 */

function errorHandler(err, req, res, next) {
  console.error(`Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
