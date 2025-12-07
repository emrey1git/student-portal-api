// src/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Yeni kullanıcı kaydı (Admin/Teacher/Parent)
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Kullanıcı girişi ve JWT/Refresh Token alma
// @access  Public
router.post('/login', loginUser);

// NOT: getCurrentUser rotası, JWT ve Middleware gerektireceği için şimdilik pasif.
// router.get('/me', authGuard, getCurrentUser); 

module.exports = router;