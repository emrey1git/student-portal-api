// src/controllers/studentController.js (Nihai Düzeltme)

const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Yeni öğrenci kaydı oluştur
// @route   POST /api/students
// @access  Private (Admin, Teacher)
const createStudent = async (req, res) => {
    const { firstName, lastName, studentNumber, dateOfBirth, teacher, parent, grades } = req.body;
    try {
        const studentExists = await Student.findOne({ studentNumber });

        if (studentExists) {
            return res.status(400).json({ message: 'Bu öğrenci numarası zaten kayıtlı.' });
        }

        const student = await Student.create({
            firstName,
            lastName,
            studentNumber,
            dateOfBirth,
            teacher: teacher || (req.user.role === 'teacher' ? req.user._id : undefined),
            parent,
            grades
        });
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Öğrenci oluşturulurken bir hata oluştu: ' + error.message });
    }
};

// @desc    Tüm öğrencileri getir
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getAllStudents = async (req, res) => {
    try {
        let students;

        if (req.user.role === 'admin') {
            students = await Student.find({}).populate('teacher', 'email firstName').populate('parent', 'email');
        } else if (req.user.role === 'teacher') {
            students = await Student.find({ teacher: req.user._id }).populate('parent', 'email');
        } else {
            return res.status(403).json({ message: 'Bu listeye erişim yetkiniz yok.' });
        }
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Öğrenci listesi getirilirken bir hata oluştu: ' + error.message });
    }
}; // <-- Önceki hatalı noktalı virgül ve parantezler temizlendi!

// @desc    Belirli bir öğrenciyi ID'sine göre getir
// @route   GET /api/students/:id
// @access  Private (Admin, Teacher, Parent-kendi çocuğuysa)
const getStudentById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Geçersiz öğrenci ID formatı.' });
    }
    try {
        const student = await Student.findById(id).populate('teacher', 'email').populate('parent', 'email');
        if (!student) {
            return res.status(404).json({ message: 'Öğrenci bulunamadı.' });
        }

        const userRole = req.user.role;
        const userId = req.user._id;

        if (userRole === 'admin' || userRole === 'teacher') {
            return res.json(student);
        }
        if (userRole === 'parent' && student.parent && student.parent.toString() === userId.toString()) {
            return res.json(student);
        }
        res.status(403).json({ message: 'Bu öğrencinin bilgilerini görmeye yetkiniz yoktur.' });
    } catch (error) {
        res.status(500).json({ message: 'Öğrenci getirilirken bir hata oluştu: ' + error.message });
    }
};

// @desc    Öğrenci bilgilerini güncelle
// @route   PUT /api/students/:id
// @access  Private (Admin, Teacher)
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Geçersiz öğrenci ID formatı.' });
    }

    try {
        const studentToUpdate = await Student.findById(id);

        if (!studentToUpdate) {
            return res.status(404).json({ message: 'Güncellenecek öğrenci bulunamadı.' });
        }

        // Yetkilendirme Kontrolü (Teacher'ın kendi öğrencisi mi?)
        if (
            req.user.role === 'teacher' &&
            (!studentToUpdate.teacher || studentToUpdate.teacher.toString() !== req.user._id.toString())
        ) {
            return res.status(403).json({ message: 'Sadece kendi öğrencilerinizi güncelleyebilirsiniz.' });
        }

        const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        res.json(updatedStudent);

    } catch (error) {
        res.status(500).json({ message: 'Öğrenci güncellenirken bir hata oluştu: ' + error.message });
    }
};

// @desc    Öğrenci kaydını sil
// @route   DELETE /api/students/:id
// @access  Private (Sadece Admin)
const deleteStudent = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Geçersiz öğrenci ID formatı.' });
    }
    try {
        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            return res.status(404).json({ message: 'Silinecek öğrenci bulunamadı.' });
        }
        res.json({ message: 'Öğrenci başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Öğrenci silinirken bir hata oluştu: ' + error.message });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
};