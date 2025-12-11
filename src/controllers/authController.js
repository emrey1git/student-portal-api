const User = require("../models/User.js");
const jwt = require("jsonwebtoken"); // JWT üretimi için bu paketi kuracağız!

// JWT Token Üretme Fonksiyonu
// Access Token kısa ömürlü yap
const generateToken = (id, role) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set in environment');
  }
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
// Refresh Token
//uzun ömür
const generateRefreshToken = (id, role) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not set in environment');
  }
  return jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Yeni Kullanıcı Kaydı
// @route   POST /api/auth/register
// @access  Public

const registerUser = async (req, res) => {
  const { email, password, role } = req.body;
  // Basit kontrol
  if (!email || !password) {
    return res.status(400).json({
      message: "Lütfen tüm zorunlu alanları doldurun (email, password).",
    });
  }
  try {
    // Kullanıcı zaten var mı kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Bu email ile zaten kayıtlı bir kullanıcı var." });
    }

    // Yeni kullanıcı oluştur (Şifre, User.js modelindeki 'pre-save' hook'u sayesinde otomatik hash'lenecek)
    const user = await User.create({
      email,
      password,
      role,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role), // Token'ı hemen ver
        // Refresh token'ı veritabanına kaydetme işini şimdilik pas geçiyoruz.
      });
    } else {
      res.status(400).json({ message: "Geçersiz kullanıcı verisi." });
    }
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

// @desc    Kullanıcı Girişi
// @route   POST /api/auth/login
// @access  Public

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kullanıcıyı bul (Şifreyi select:false olduğu için ayrıca çağırmamız gerekebilir)
    const user = await User.findOne({ email }).select("+password");

    //kullanıcı yok veya şifre eşleşmiyor
    if (user && (await user.matchPassword(password))) {

      const refreshToken = generateRefreshToken(user._id, user.role);

        // JWT Cookie Ayarları (Güvenlik için kritik)
        res.cookie('jwt', refreshToken, {
            httpOnly: true, // Sadece sunucu tarafından erişilebilir (XSS saldırılarını önler)
            secure: process.env.NODE_ENV === 'production', // Sadece HTTPS'de gönder (Canlıda)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
            sameSite: 'strict' // CSRF koruması
        });

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        accessToken: generateToken(user._id, user.role),
       
      });
    } else {
      res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};
// @desc    Token'ı yeniler (Refresh Token kullanarak)
// @route   GET /api/auth/refresh
// @access  Private (Refresh Token ile)
const handleRefreshToken = async (req, res) => {
    // 1. Refresh Token'ı Cookie'den al
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Yetkisiz erişim, Refresh Token bulunamadı.' });
    }

    const refreshToken = cookies.jwt;

    // 2. Token'ı doğrula
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // 3. Yeni Access Token üret
        const newAccessToken = generateToken(decoded.id, decoded.role);

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        // Token geçersizse veya süresi dolmuşsa
        console.error('Refresh Token Hatası:', error.message);
        res.status(403).json({ message: 'Yenileme Tokenı geçersiz veya süresi dolmuş.' });
    }
};
module.exports = { registerUser, loginUser, handleRefreshToken};