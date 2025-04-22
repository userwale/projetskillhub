const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const instructorController = require('../controllers/instructorController');
const multer = require('multer');
const path = require('path');

// ---------- CONFIGURATION MULTER POUR L'UPLOAD DES FICHIERS ----------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Dossier où les fichiers seront enregistrés
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Renommer le fichier pour éviter les conflits
    }
});

const upload = multer({ storage: storage });

// ---------- AUTH ----------
// Route pour l'inscription d'un instructeur
router.post('/signup', instructorController.signupInstructor);

// Route pour la connexion d'un instructeur
router.post('/login', instructorController.loginInstructor);

// ---------- PROFILE ----------
// Route pour voir le profil d'un instructeur
router.get('/:instructorId/profile', instructorController.viewInstructorProfile);

// Route pour mettre à jour le profil d'un instructeur
router.put('/:instructorId/profile', auth.authenticate, instructorController.updateInstructorProfile);

// ---------- COURSES ----------
// Route pour ajouter un nouveau cours
router.post('/courses', auth.authenticate, instructorController.addNewCourse);

// Route pour obtenir tous les cours d'un instructeur
router.get('/:instructorId/courses', instructorController.getAllCoursesByInstructorId);

// Route pour obtenir un cours par son ID
router.get('/courses/:courseId', instructorController.getCourseById);

// Route pour obtenir tous les cours
router.get('/courses', instructorController.getAllCourses);

// Route pour ajouter un contenu au cours
router.post('/courses/:courseId/content', instructorController.addCourseContent);

// Route pour mettre à jour le statut d'un cours
router.put('/courses/:courseId/status', instructorController.updateCourseStatus);

// Route pour supprimer un cours
router.delete('/courses/:courseId', instructorController.deleteCourse);

// ---------- INSTRUCTORS ----------
// Route pour obtenir tous les instructeurs
router.get('/all', instructorController.getAllInstructors);

// Route pour supprimer un instructeur
router.delete('/:instructorId', instructorController.deleteInstructor);

// Route pour créer un instructeur
router.post('/instructor', instructorController.createInstructor);

// Route pour voir un profil d'instructeur spécifique par son ID
router.get('/instructor/:instructorId', instructorController.viewInstructorProfile);

// ---------- UPLOADS FICHIERS ----------
router.post('/upload', auth.authenticate, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Renvoie l'URL du fichier téléchargé
    const fileUrl = `http://localhost:8072/uploads/${req.file.filename}`;
    res.json({ fileUrl });
});

module.exports = router;
