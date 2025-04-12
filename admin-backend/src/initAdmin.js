const mongoose = require('mongoose');
const Admin = require('/models/adminModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

const createDefaultAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            const newAdmin = new Admin({
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
                name: process.env.ADMIN_NAME,
            });
            await newAdmin.save();
            console.log('✅ Default admin created');
        } else {
            console.log('ℹ️ Admin already exists');
        }
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    }
};

const db = process.env.MONGODB_URI;

mongoose
    .connect(db)
    .then(() => {
        console.log('MongoDB successfully connected');
        createDefaultAdmin();
    })
    .catch(err => console.log(err));
