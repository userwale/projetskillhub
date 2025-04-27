const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,  // Trim to avoid extra spaces
    },
    description: {
        type: String,
        required: true,
    },
    content: [{
        title: String,
        doc_type: String,
        url: {
            type: String,
            match: [/^https?:\/\/.+$/, 'Invalid URL format']  // URL validation regex
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    instructor: {
        type: Schema.Types.ObjectId,
        ref: 'Instructor'
    },
});

module.exports = mongoose.model('Course', CourseSchema);
