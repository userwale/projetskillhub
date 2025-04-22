const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

// Configuration de la limitation de taux
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // 5 requêtes max par fenêtre
    message: {
        success: false,
        message: 'Too many attempts, please try again later.'
    },
    standardHeaders: true,     // Retourne les infos de limite dans les headers
    legacyHeaders: false       // Désactive les headers X-RateLimit-*
});



// ---------- ADMIN AUTHENTICATION ----------
router.post('/verify-key', authLimiter, adminController.verifyAdminKey);
router.post('/signup', authLimiter, adminController.adminSignup);
router.post('/login', authLimiter, adminController.adminLogin);

// ---------- ADMIN PROFILE ----------
router.get('/profile', auth.authenticate, adminController.viewAdminProfile)
router.put('/profile',auth.authenticate, adminController.updateAdminProfile);

// ---------- LEARNERS MANAGEMENT ----------
router.get('/learners', auth.authenticate, adminController.getAllStudents);
router.delete('/learner/:learnerId', auth.authenticate, adminController.deleteLearner);
router.post('/learners', auth.authenticate, adminController.createLearner);
router.put('/learner/:learnerId', auth.authenticate, adminController.updateLearner);

// ---------- COURSES MANAGEMENT ----------
router.get('/courses',auth.authenticate, adminController.getAllCourses);
router.delete('/course/:courseId', auth.authenticate, adminController.deleteCourse);

// ---------- INSTRUCTORS MANAGEMENT ----------
router.get('/instructors',auth.authenticate, adminController.getAllInstructors)
router.post('/instructors', auth.authenticate, adminController.createInstructor);

router.get('/instructor/:instructorId',auth.authenticate, adminController.getInstructorById)
router.delete('/instructor/:instructorId',auth.authenticate, adminController.deleteInstructor);


module.exports = router; 

