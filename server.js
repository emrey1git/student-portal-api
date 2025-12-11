// server.js (NİHAİ VE GÜNCEL SÜRÜM)

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // ⬅️ DÜZELTME: cookieParser artık tanımlı
require('dotenv').config();

// Swagger için gerekli paketler
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
// Swagger dosyasını yükle (Dosyanın projenin ana dizininde olduğunu varsayıyoruz)
const swaggerDocument = YAML.load('./swagger.yaml'); 


// ===============================================
// 1. ADIM: Router'ları içeri aktarıyoruz
const authRoutes = require('./src/routes/authRoutes.js');
const studentRoutes = require('./src/routes/studentRoutes.js')
// ===============================================

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser()); // cookieParser middleware'ini kullan

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Başarıyla Bağlandı!');
    } catch (error) {
        console.error('❌ MongoDB Bağlantı Hatası:', error.message);
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

// SWAGGER DOKÜMANTASYON ROTASI (http://localhost:3000/api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
// ===============================================


const startServer = async () => {
    // Gerekli ortam değişkenleri kontrolü (Aynı)

    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Sunucu ${PORT} portunda çalışıyor. (http://localhost:${PORT})`);
        console.log(`Mod: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();