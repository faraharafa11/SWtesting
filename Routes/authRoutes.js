// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../Controller/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { registerValidators, loginValidators } = require('../middlewares/validators/authValidators');

// Auth routes with validators applied before controllers
router.post('/auth/register', registerValidators, auth.register);
router.post('/auth/login', loginValidators, auth.login);
router.get('/auth/me', verifyToken, auth.me);

module.exports = router;
