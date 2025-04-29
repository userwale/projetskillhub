const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/files', express.static(path.join(__dirname, '..', 'uploads', 'files')));
app.use('/uploads/videos', express.static(path.join(__dirname, '..', 'uploads', 'videos')));


// Routes
const instructorRoutes = require('./routes/instructorRoutes');
app.use('/api/instructor', instructorRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// Server
const PORT = process.env.PORT || 8072;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});