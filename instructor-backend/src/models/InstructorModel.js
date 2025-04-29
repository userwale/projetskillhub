const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const InstructorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,  // Trim to avoid extra spaces
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Convertir le courrier électronique en minuscules pour plus d'uniformité
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'] // Email validation regex
    },
    title: {
        type: String,
        required: true
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    userType: {
        type: String,
        enum: ['admin', 'instructor', 'learner'],
        default: 'instructor'
    }
});

module.exports = mongoose.model('Instructor', InstructorSchema);
