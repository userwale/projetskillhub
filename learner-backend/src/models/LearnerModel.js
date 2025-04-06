const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LearnerSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,  // Trim to avoid extra spaces
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long']  // Password length validation
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,  // Convert email to lowercase for uniformity
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'] // Email validation regex
    },
    description: {
        type: String
    },
    userType: {
        type: String,
        enum: ['admin', 'instructor', 'learner'],
        default: 'learner'
    }
});

module.exports = mongoose.model('Learner', LearnerSchema);
