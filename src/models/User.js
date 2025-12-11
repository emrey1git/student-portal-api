const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // 🚨 GÜNCELLEME: Şifre, Google ID yoksa zorunlu olsun
        required: function() {
            return !this.googleId;
        },
        select: false
    },
    role:{
        type: String,
        enum: ['admin','teacher','parent'],
        default: 'parent'
    },
    // Google OAuth
    googleId: {
        type: String,
        required: false,
    }
}, { timestamps: true });

// --- Pre-Save Hook (Şifre Hashleme) --- Kullanıcı kaydedilmeden hemen önce çalışacak middleware
UserSchema.pre('save', async function() {
    // Şifre değiştirilmemişse veya yeni bir şifre değilse, hash'leme yapma
    if (!this.isModified('password')) {
        return;
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10); // sayı yükseldikçe güvenlik artar ama performans düşer
    this.password = await bcrypt.hash(this.password, salt);
});

// --- Method: Şifre Karşılaştırma ---
UserSchema.methods.matchPassword = async function(enteredPassword) {
// select:false olduğu için 'this.password'a erişmek gerekir, ancak Mongoose bu metotlarda bunu halleder.
    // Yine de JWT bölümünde 'select:false' alanını almak için ek işlem yapacağız.
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;