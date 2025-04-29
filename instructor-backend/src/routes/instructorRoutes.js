const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const instructorController = require('../controllers/instructorController');
const upload = require('../middleware/upload'); 
const fs = require('fs');

// Auth routes
router.post('/signup', instructorController.signupInstructor);
router.post('/login', instructorController.loginInstructor);

// Profile routes
router.get('/:instructorId/profile', auth.authenticate, instructorController.viewInstructorProfile);
router.put('/:instructorId/profile', auth.authenticate, instructorController.updateInstructorProfile);

// Course routes
router.post('/courses', auth.authenticate, instructorController.addNewCourse);
router.get('/:instructorId/courses', auth.authenticate, instructorController.getAllCoursesByInstructorId);
router.get('/courses/:courseId', instructorController.getCourseById);
router.get('/courses', instructorController.getAllCourses);
router.delete('/courses/:courseId', auth.authenticate, instructorController.deleteCourse);
router.post('/courses/:courseId/add-content', auth.authenticate, upload, instructorController.addCourseContent);
router.put('/courses/:courseId', auth.authenticate, instructorController.updateCourse);
// Suppression de cours par l'administrateur
router.delete('/admin/courses/:courseId', auth.authenticate, instructorController.adminDeleteCourse);


// Admin instructor routes
router.get('/all', auth.authenticate, instructorController.getAllInstructors);
router.delete('/:instructorId', auth.authenticate, instructorController.deleteInstructor);
router.post('/instructor', auth.authenticate, instructorController.createInstructor);

// Upload files (autres fichiers indépendants)
router.post('/uploads', auth.authenticate, upload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded or invalid type' });
    }
    res.json({
        success: true,
        fileUrl: `/uploads/${req.file.filename}`, 
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
    });
});

module.exports = router;
