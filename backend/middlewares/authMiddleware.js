// middlewares/authMiddleware.js
/**
 * @fileoverview Middleware for JWT-based authentication and admin role verification.
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * @function verifyToken
 * @description Verifies JWT token from Authorization header.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * @function requireAdmin
 * @description Checks if the authenticated user is an admin.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
}

module.exports = { verifyToken, requireAdmin };
