// controllers/authController.js
/**
 * @fileoverview Authentication controller for user registration, login, and profile retrieval.
 * Implements FR1 and NFR3 (Security) using bcrypt + JWT.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../Model/User');
const { createUser } = require('../utils/userFactory');
const { makeUserDTO } = require('../utils/dtoFactory');
const { registerValidators, loginValidators } = require('../middlewares/validators/authValidators');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES = '7d';


/**
 * @desc Register new user (FR1)
 * @route POST /api/auth/register
 * @returns {Object} user + JWT token
 */
async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const data = createUser(name, email, hashed, role || 'user');
  const user = await User.create(data);

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.status(201).json({ user: makeUserDTO(user), token });
}

/**
 * @desc Login user (FR1)
 * @route POST /api/auth/login
 * @returns {Object} user + JWT token
 */
async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ user: makeUserDTO(user), token });
}

/**
 * @desc Get logged-in user profile
 * @route GET /api/auth/me
 */
async function me(req, res) {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: makeUserDTO(user) });
}

module.exports = { register, login, me };
