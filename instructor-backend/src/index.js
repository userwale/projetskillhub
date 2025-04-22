const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const instructor = require('./routes/instructorRoutes');
const path = require('path');
const cors = require('cors');


require('dotenv').config();
const app = express();

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Middleware
app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// Connexion à MongoDB
const db = process.env.MONGODB_URI;
console.log("Mongo URI:", db); // pour debug

mongoose
    .connect(db)
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/instructor', instructor);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Serveur
const port = process.env.PORT || 8072;
app.listen(port, () => console.log(`Server up and running on port ${port}!`));

// Route pour les fichiers téléchargés
app.use('/uploads', express.static('uploads')); // pour servir les fichiers uploadés
