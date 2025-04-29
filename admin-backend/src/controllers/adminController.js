const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Admin = require('../models/adminModel');

dotenv.config();

// Method to verify activation key
exports.verifyAdminKey = async (req, res) => {
    try {
        const { activationKey } = req.body;

        if (!activationKey) {
            return res.status(400).json({
                success: false,
                message: 'Activation key required'
            });
        }

        // Remove spaces and invisible characters
        const cleanedInputKey = activationKey.trim();
        const cleanedEnvKey = process.env.ADMIN_ACTIVATION_KEY.trim();

        console.log('Clé reçue du client:', cleanedInputKey);
        console.log('Clé attendue (.env):', cleanedEnvKey);

        if (cleanedInputKey !== cleanedEnvKey) {
            return res.status(403).json({
                success: false,
                message: 'Invalid activation key',
                debug: {
                    received: cleanedInputKey,
                    expected: cleanedEnvKey,
                    match: cleanedInputKey === cleanedEnvKey
                }
            });
        }

        const tempToken = jwt.sign(
            { canRegisterAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            message: 'Activation key validated',
            token: tempToken
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification',
            error: error.message
        });
    }
};

// Admin signup method updated with temporary token verification
exports.adminSignup = async (req, res) => {
    try {
        // Verify temporary token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.canRegisterAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Invalid authorization token'
            });
        }

        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 10 characters, one uppercase, one lowercase, one number, and one special character'
            });
        }

        // Create new admin
        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = new Admin({
            name,
            email,
            password: hashedPassword,
            userType: 'admin'
        });

        await admin.save();

        // Generate final JWT token
        const authToken = generateToken(admin);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            token: authToken,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.userType
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating admin',
            error: error.message
        });
    }
};

// Admin login method enhanced
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        console.log('Login attempt:', email, password);

        const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }


        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            console.log('Incorrect password');
        }


        // Update last access time
        admin.lastAccess = new Date();
        await admin.save();

        const token = generateToken(admin);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.userType
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};


exports.getAllCourses = async (req, res) => {
    try {
        // Appel à l'API de l'instructeur pour récupérer les cours
        const response = await axios.get('http://localhost:8072/api/instructor/courses', {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        // Si la réponse contient les données des cours avec l'instructeur
        if (response.data && response.data.length > 0) {
            // Traitement pour ajouter des informations supplémentaires si nécessaire
            const coursesWithInstructor = response.data.map(course => {
                return {
                    ...course,
                    instructor: course.instructor || {}  // Si l'instructeur n'est pas directement dans la réponse, ajoute une valeur par défaut
                };
            });

            res.status(200).json({
                success: true,
                data: coursesWithInstructor
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No courses found'
            });
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to fetch courses';
        res.status(status).json({
            success: false,
            message
        });
    }
};


exports.getAllStudents = async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8073/api/learner/all-learners', {
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to fetch students';
        res.status(status).json({
            success: false,
            message
        });
    }
};

exports.getAllInstructors = async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8072/api/instructor/all', {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error fetching instructors:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to fetch instructors';
        res.status(status).json({
            success: false,
            message
        });
    }
};

exports.viewAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error('Error viewing admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin profile',
            error: error.message
        });
    }
};


exports.updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { name, email } = req.body;
        let updatedData = { name, email };

        // Mettre à jour les infos dans la base de données
        const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updatedData, { new: true });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                profilePhoto: updatedAdmin.profilePhoto,  // Retourner la photo si nécessaire
            }
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

exports.changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Vérification du mot de passe actuel
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Mise à jour du mot de passe
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};


exports.updateLearner = async (req, res) => {
    const { learnerId } = req.params;
    const { name, email, description, password } = req.body; // Ajouter password

    try {
        const response = await axios.put(`http://localhost:8073/api/learner/${learnerId}`, {
            name,
            email,
            description,
            password // Inclure le mot de passe
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error updating learner:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.getInstructorById = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const response = await axios.get(`http://localhost:8072/api/instructor/${instructorId}`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error fetching instructor by ID:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to fetch instructor';
        res.status(status).json({
            success: false,
            message
        });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;

        // Vérification supplémentaire pour les opérations sensibles
        if (req.user.id === instructorId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await axios.delete(`http://localhost:8072/api/instructor/${instructorId}`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        res.status(200).json({
            success: true,
            message: 'Instructor deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting instructor:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to delete instructor';
        res.status(status).json({
            success: false,
            message
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByIdAndDelete(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete course'
        });
    }
};

exports.deleteLearner = async (req, res) => {
    try {
        const { learnerId } = req.params;

        // Appel au microservice "learner"
        await axios.delete(`http://localhost:8073/api/learner/${learnerId}`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        res.status(200).json({
            success: true,
            message: 'Learner deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting learner:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to delete learner';
        res.status(status).json({
            success: false,
            message
        });
    }
};

exports.createInstructor = async (req, res) => {
    try {
        const instructorData = req.body;

        const response = await axios.post('http://localhost:8072/api/instructor/signup', instructorData, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        res.status(201).json({
            success: true,
            message: 'Instructor created successfully',
            data: response.data
        });
    } catch (error) {
        console.error('Error creating instructor:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to create instructor';
        res.status(status).json({
            success: false,
            message
        });
    }
};
exports.createLearner = async (req, res) => {
    try {
        const learnerData = req.body;

        const response = await axios.post('http://localhost:8073/api/learner/signup', learnerData, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        res.status(201).json({
            success: true,
            message: 'Learner created successfully',
            data: response.data
        });
    } catch (error) {
        console.error('Error creating learner:', error);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Failed to create learner';
        res.status(status).json({
            success: false,
            message
        });
    }
};
