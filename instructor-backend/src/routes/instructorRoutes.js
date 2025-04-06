const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const instructorController = require('../controllers/instructorController');

// ---------- AUTH ----------
router.post('/signup', instructorController.signupInstructor);
router.post('/login', instructorController.loginInstructor);

// ---------- PROFILE ----------
router.get('/:instructorId/profile', instructorController.viewInstructorProfile);
router.put('/:instructorId/profile', auth.authenticate, instructorController.updateInstructorProfile);

// ---------- COURSES ----------
router.post('/courses', auth.authenticate, instructorController.addNewCourse);
router.get('/:instructorId/courses', instructorController.getAllCoursesByInstructorId);
router.get('/course/:courseId', instructorController.getCourseById);
router.get('/courses', instructorController.getAllCourses);
router.post('/course/:courseId/content', instructorController.addCourseContent);
router.put('/course/:courseId/status', instructorController.updateCourseStatus);
router.delete('/course/:courseId', instructorController.deleteCourse);

// ---------- INSTRUCTORS ----------
router.get('/all', instructorController.getAllInstructors);
router.delete('/:instructorId', instructorController.deleteInstructor); // Delete instructor
router.post('/instructor', instructorController.createInstructor); // Créer un instructeur
router.get('/instructor/:instructorId', instructorController.viewInstructorProfile); // Lire/récupérer un instructeur par son ID

module.exports = router;
