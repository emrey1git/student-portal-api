// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User modeline erişim

// --- 1. JWT Doğrulama Middleware'i (Auth Guard) ---
const authGuard = async (req, res, next) => {
    let token;

    // 1. Authorization Header kontrolü (Bearer Token var mı?)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Token'ı "Bearer <TOKEN>" kısmından ayır
            token = req.headers.authorization.split(' ')[1];

            // Token'ı gizli anahtar ile doğrula (Verify)
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // Token içindeki ID ile kullanıcıyı veritabanından şifre hariç getir
            req.user = await User.findById(decoded.id).select('-password');
            
            // Başarılıysa devam et
            next();

        } catch (error) {
            console.error('Token Doğrulama Hatası:', error.message);
            // Token geçersizse 401 Unauthorized hatası dön
            res.status(401).json({ message: 'Yetkisiz erişim, token geçersiz.' });
        }
    }

    // 2. Token hiç yoksa
    if (!token) {
        res.status(401).json({ message: 'Yetkisiz erişim, token bulunamadı.' });
    }
};

// --- 2. Rol Kontrol Middleware'i (isAdmin, isTeacher, vb.) ---
// Sadece izin verilen rollere sahip kullanıcıların devam etmesini sağlar
const hasRole = (allowedRoles) => (req, res, next) => {
    // req.user objesi authGuard tarafından zaten eklenmiş olmalı.
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        // Rol yetersizse 403 Forbidden hatası dön
        return res.status(403).json({ 
            message: 'Erişim reddedildi. Bu işlem için yeterli yetkiye sahip değilsiniz.',
            requiredRole: allowedRoles
        });
    }
    // Yetki varsa devam et
    next();
};

// Rol bazlı kolaylıklar
const isAdmin = hasRole(['admin']);
const isTeacher = hasRole(['admin', 'teacher']);
const isParent = hasRole(['admin', 'teacher', 'parent']); 

module.exports = { authGuard, isAdmin, isTeacher, isParent };