const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

// ---------- CONFIGURATION UPLOAD PHOTO ----------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier de stockage
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nom unique
    }
});

const upload = multer({ storage });

// ---------- CONFIGURATION DE RATE LIMITER ----------
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // 5 requêtes max par fenêtre
    message: {
        success: false,
        message: 'Too many attempts, please try again later.'
    },
    standardHeaders: true,    
    legacyHeaders: false      
});

// ---------- ADMIN AUTHENTICATION ----------
router.post('/verify-key', authLimiter, adminController.verifyAdminKey);
router.post('/signup', authLimiter, adminController.adminSignup);
router.post('/login', authLimiter, adminController.adminLogin);

// ---------- ADMIN PROFILE ----------
router.get('/profile', auth.authenticate, adminController.viewAdminProfile);

// Route pour changer le mot de passe de l'admin
router.put('/change-password', auth.authenticate, adminController.changeAdminPassword);

// ---------- LEARNERS MANAGEMENT ----------
router.get('/learners', auth.authenticate, adminController.getAllStudents);
router.post('/learners', auth.authenticate, adminController.createLearner);
router.put('/learner/:learnerId', auth.authenticate, adminController.updateLearner);
router.delete('/learner/:learnerId', auth.authenticate, adminController.deleteLearner);

// ---------- COURSES MANAGEMENT ----------
router.get('/courses', auth.authenticate, adminController.getAllCourses);
router.delete('/course/:courseId', auth.authenticate, adminController.deleteCourse);

// ---------- INSTRUCTORS MANAGEMENT ----------
router.get('/instructors', auth.authenticate, adminController.getAllInstructors);
router.post('/instructors', auth.authenticate, adminController.createInstructor);
router.get('/instructor/:instructorId', auth.authenticate, adminController.getInstructorById);
router.delete('/instructor/:instructorId', auth.authenticate, adminController.deleteInstructor);

module.exports = router;
