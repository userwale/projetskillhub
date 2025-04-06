const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// ---------- AUTH ----------
router.post('/signup', adminController.adminSignup);
router.post('/login', adminController.adminLogin);

// ---------- ADMIN PROFILE ----------
router.get('/profile', auth.authenticate, adminController.viewAdminProfile);
router.put('/profile', auth.authenticate, adminController.updateAdminProfile);

// ---------- LEARNERS ----------
router.get('/all-students', adminController.getAllStudents); // Liste tous les learners
router.delete('/learner/:learnerId', adminController.deleteLearner); // Supprimer un learner

// ---------- COURSES ----------
router.put('/course/:courseId/status', adminController.updateCourseStatus);// Changer le statut d’un cours
router.get('/all-courses', auth.authenticate, adminController.getAllCourses);// Lister tous les cours
router.delete('/course/:courseId', adminController.deleteCourse); // Supprimer un cours

// ---------- INSTRUCTORS ----------
router.get('/instructors', adminController.getAllInstructors); // Lister tous les instructeurs
router.post('/instructor', adminController.createInstructor); // Créer un instructeur
router.get('/instructor/:instructorId', adminController.getInstructorById); // Lire un instructeur
router.delete('/instructor/:instructorId', adminController.deleteInstructor); // Supprimer un instructeur


module.exports = router;
