const User = require("../models/User");
const jwt = require("jsonwebtoken"); // JWT üretimi için bu paketi kuracağız!

// JWT Token Üretme Fonksiyonu
// Access Token kısa ömürlü yap
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
// Refresh Token
//uzun ömür
const genereteRefreshToken = (id, role) => {
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
      res.status(201).jjson({
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
    if (User && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        accessToken: generateToken(user._id, user.role),
        refreshToken: genereteRefreshToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Geçersiz e-posta veya şifre." });
    }
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası: " + error.message });
  }
};

module.exports = { registerUser, loginUser };