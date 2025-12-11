// src/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, getCurrentUser,handleRefreshToken } = require('../controllers/authController');

const { validateBody, registerSchema, loginSchema } = require('../middleware/authMiddleware'); 
const passport = require('passport');   
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

// ------------------------------------------
// GOOGLE OAUTH ROTLARI
// ------------------------------------------

// @route  GET /api/auth/google
// @desc   Google'a yönlendirme (Giriş Başlatma)
// @access Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


// @route  GET /api/auth/google/callback
// @desc   Google'dan geri dönüş (Giriş Tamamlama)
// @access Public
router.get(
    '/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }), // Başarısız olursa ana sayfaya yönlendir
    (req, res) => {
        // Başarılı girişten sonra, kullanıcıyı token ile yönlendirebiliriz
        // Basitçe: Başarılı mesajı dön
        res.json({ message: 'Google ile giriş başarılı!', user: req.user });
        
        // VEYA: Frontend'e Access Token ile yönlendirme (Gerçek uygulamada bu yapılır)
        // const token = generateToken(req.user._id, req.user.role);
        // res.redirect(`http://frontend-url/dashboard?token=${token}`);
    }
);
module.exports = router;