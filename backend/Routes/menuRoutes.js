// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../Controller/menuController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const { addMenuValidators, updateMenuValidators, deleteMenuValidators } = require('../middlewares/validators/menuValidators');

// Public route (FR2)
router.get('/menu', menuController.getAllMenuItems);

// Admin routes (FR7)
router.post('/admin/menu', verifyToken, requireAdmin, addMenuValidators, menuController.addMenuItem);
router.put('/admin/menu/:id', verifyToken, requireAdmin, updateMenuValidators, menuController.updateMenuItem);
router.delete('/admin/menu/:id', verifyToken, requireAdmin, deleteMenuValidators, menuController.deleteMenuItem);

module.exports = router;
