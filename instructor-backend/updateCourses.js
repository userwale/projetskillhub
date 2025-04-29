const mongoose = require('mongoose');
const Course = require('./src/models/CourseModel');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillhub')
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const updated = await Course.updateMany(
            { category: { $exists: false } }, 
            { $set: { category: 'uncategorized' } }
        );

        console.log(`✅ ${updated.modifiedCount} course(s) updated with category 'uncategorized'.`);
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('❌ Error connecting to MongoDB:', err);
    });

