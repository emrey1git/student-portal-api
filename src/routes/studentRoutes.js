// src/routes/studentRoutes.js

const express = require('express');

// CONTROLLER'I DAHİL ET
const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController'); // Kontrol: Yol doğru olmalı

// MIDDLEWARE'LERİ DAHİL ET
const {
    authGuard,
    isAdmin,
    isTeacher
} = require('../middleware/authMiddleware'); // Kontrol: Yol doğru olmalı

const router = express.Router();

// --- CRUD ROTLARI VE GEREKLİ YETKİLENDİRMELER ---

// @route   POST /api/students - Yeni öğrenci kaydı oluşturma
// @access  Private (Admin ve Teacher)
router.post('/', authGuard, isTeacher, createStudent);

// @route   GET /api/students - Tüm öğrencileri listeleme
// @access  Private (Admin ve Teacher)
router.get('/', authGuard, isTeacher, getAllStudents);

// @route   GET /api/students/:id - Belirli bir öğrencinin detaylarını getirme
// @access  Private (Admin, Teacher ve Parent- kendi çocuğuysa)
router.get('/:id', authGuard, getStudentById);

// @route   PUT /api/students/:id - Öğrenci bilgilerini güncelleme
// @access  Private (Admin ve Teacher)
router.put('/:id', authGuard, isTeacher, updateStudent);

// @route   DELETE /api/students/:id - Öğrenci kaydını silme
// @access  Private (Sadece Admin)
router.delete('/:id', authGuard, isAdmin, deleteStudent);

module.exports = router;