const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

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

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Sunucu ${PORT} portunda çalışıyor. (http://localhost:${PORT})`);
        console.log(`Mod: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();