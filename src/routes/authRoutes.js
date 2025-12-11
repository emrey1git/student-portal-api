// src/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, getCurrentUser,handleRefreshToken } = require('../controllers/authController');

const { validateBody, registerSchema, loginSchema } = require('../middleware/authMiddleware'); 

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Yeni kullanıcı kaydı (Admin/Teacher/Parent)
// @access  Public
router.post('/register', validateBody(registerSchema), registerUser);

// @route   POST /api/auth/login
// @desc    Kullanıcı girişi ve JWT/Refresh Token alma
// @access  Public
router.post('/login', validateBody(loginSchema), loginUser);

router.get('/refresh', handleRefreshToken);
// NOT: getCurrentUser rotası, JWT ve Middleware gerektireceği için şimdilik pasif.
// router.get('/me', authGuard, getCurrentUser); 

module.exports = router;