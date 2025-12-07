const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true

    },
    lastName: {
        type: String,
        required: true,
        trim: true  
    },
    studentNumber: {
        type: String,
        required: true,
        unique: true,
    },
    // Portal Rol İlişkileri
    // Öğrenciyi kimin yönettiğini/gördüğünü belirler
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 'teacher' rolüne sahip User modeli
        required: true      
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    // Notlar ve Dersler (Daha karmaşık veriler için Sub-Schema kullanılabilir)
    grades: [
        {
            subject:{
                type:String,
                required:true
            },
            score:{
                type:Number,
                required:true,
                min: 0,
                max: 100
            },
            date:{
                type: Date,
                default: Date.now
      }
        }
    ]

}, {
    timestamps: true // created/updated at alanlarını otomatik ekler
});

const Student = mongoose.model('Studemt', StudentSchema);
module.exports = Student;