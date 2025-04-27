const multer = require('multer');
const path = require('path');

// Définir le filtrage des fichiers autorisés
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'video/mp4',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not allowed'), false);
};

// Définir le stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destFolder;
        if (file.mimetype.startsWith('video')) {
            destFolder = path.join(__dirname, '../../uploads/videos');
        } else {
            destFolder = path.join(__dirname, '../../uploads/files');
        }
        cb(null, destFolder);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Créer l'objet upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 Mo
    }
});

module.exports = upload;
