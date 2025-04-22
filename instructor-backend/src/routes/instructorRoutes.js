const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const instructorController = require('../controllers/instructorController');
const multer = require('multer');
const path = require('path');

// ---------- Configuration Multer D'ABORD ----------

// 1. Définir storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads')); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Définir fileFilter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'video/mp4',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé'), false);
    }
};

// 3. Initialiser upload
const upload = multer({ storage, fileFilter });

// ---------- Routes d'authentification ----------
router.post('/signup', instructorController.signupInstructor);
router.post('/login', instructorController.loginInstructor);

// ---------- Routes de profil ----------
router.get('/:instructorId/profile', auth.authenticate, instructorController.viewInstructorProfile);
router.put('/:instructorId/profile', auth.authenticate, instructorController.updateInstructorProfile);

// ---------- Routes des cours ----------
router.post('/courses', 
    auth.authenticate, 
    upload.array('files', 5), // Jusqu'à 5 fichiers
    instructorController.addNewCourse
);

router.get('/:instructorId/courses', auth.authenticate, instructorController.getAllCoursesByInstructorId);
router.get('/courses/:courseId', instructorController.getCourseById);
router.get('/courses', instructorController.getAllCourses);

router.post('/courses/:courseId/content', 
    auth.authenticate, 
    upload.single('file'),
    instructorController.addCourseContent
);

router.put('/courses/:courseId/status', auth.authenticate, instructorController.updateCourseStatus);
router.delete('/courses/:courseId', auth.authenticate, instructorController.deleteCourse);

// ---------- Routes d'administration des instructeurs ----------
router.get('/all', auth.authenticate, instructorController.getAllInstructors);
router.delete('/:instructorId', auth.authenticate, instructorController.deleteInstructor);
router.post('/instructor', auth.authenticate, instructorController.createInstructor);

// ---------- Route d'upload de fichiers ----------
router.post('/uploads', 
    auth.authenticate, 
    upload.single('file'), 
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'Aucun fichier téléchargé ou type de fichier invalide' 
            });
        }

        res.json({
            success: true,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });
    }
);

module.exports = router;
