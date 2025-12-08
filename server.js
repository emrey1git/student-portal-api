// server.js (GÜNCELLENMİŞ)

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// ===============================================
// 1. ADIM: Auth Router'ı içeri aktarıyoruz
const authRoutes = require('./src/routes/authRoutes.js');
//student routes
const studentRoutes = require('./src/routes/studentRoutes.js')
// ===============================================

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Başarıyla Bağlandı!');
    } catch (error) {
        console.error('❌ MongoDB Bağlantı Hatası:', error.message);
        // Bağlantı hatası olursa sunucuyu kapat.
        process.exit(1); 
    }
};


app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Student Portal API Aktif!',
        version: 'v1'
    });
});


// ===============================================
// 2. ADIM: Express'e rotaları tanıtıyoruz
// Tüm Auth rotaları (register, login, vb.) /api/auth altında çalışacak.
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
// ===============================================


const startServer = async () => {
    // Gerekli ortam değişkenleri hakkında kısa bir kontrol yapalım (geliştirme için bilgilendirme)
    const requiredEnv = ['MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
    const missing = requiredEnv.filter((v) => !process.env[v]);
    if (missing.length) {
        console.warn('⚠️ Eksik ortam değişkenleri bulundu:', missing.join(', '));
        console.warn('Lütfen `.env` dosyanıza gerekli değerleri ekleyin. (MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET)');
    }

    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Sunucu ${PORT} portunda çalışıyor. (http://localhost:${PORT})`);
        console.log(`Mod: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();