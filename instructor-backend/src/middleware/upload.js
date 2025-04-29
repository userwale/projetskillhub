const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const uploadsDir = path.join(__dirname, '../../uploads');
const videosDir = path.join(uploadsDir, 'videos');
const filesDir = path.join(uploadsDir, 'files');

[uploadsDir, videosDir, filesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Invalid file type');
    error.code = 'LIMIT_FILE_TYPES';
    return cb(error, false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destFolder = file.mimetype.startsWith('video') ? videosDir : filesDir;
    cb(null, destFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024 // 300MB
  }
}).single('file'); // 'file' doit correspondre au nom du champ dans FormData

// Middleware de gestion d'erreurs
upload.errorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large (max 300MB)'
    });
  }
  if (err.code === 'LIMIT_FILE_TYPES') {
    return res.status(415).json({
      success: false,
      message: 'Invalid file type'
    });
  }
  next(err);
};

module.exports = upload;