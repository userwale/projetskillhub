const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Learner = require('../models/LearnerModel');
const { hashPassword, comparePassword, generateToken } = require('../middleware/auth');
const Enrollment = require('../models/EnrollmentModel');
const axios = require('axios');

exports.createLearner = async (req, res) => {
    try {
        const { name, email, password, description } = req.body;

        const existingLearner = await Learner.findOne({ email });
        if (existingLearner) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const newLearner = new Learner({
            name,
            email,
            password: hashedPassword,
            description,
            userType: 'learner'  
        });

        await newLearner.save();
        res.status(201).json({ message: 'Learner created successfully' });
    } catch (error) {
        console.error('Error creating learner:', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.learnerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required', success: false });
        }

        console.log(`Login attempt for email: ${email}`);

        const learner = await Learner.findOne({ email });
        if (!learner) {
            console.log(`Learner not found for email: ${email}`);
            return res.status(404).json({ message: 'Learner not found', success: false });
        }

        console.log('Learner data:', learner);

        const passwordMatch = await bcrypt.compare(password, learner.password);
        if (!passwordMatch) {
            console.log('Password does not match for email:', email);
            return res.status(401).json({ message: 'Invalid credentials', success: false });
        }

        const token = generateToken(learner);

        res.status(200).json({ 
            token, 
            learnerId: learner._id,
            success: true,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error.stack);
        res.status(500).json({ message: 'Internal server error', error: error.message, success: false });
    }
};

exports.viewLearnerProfile = async (req, res) => {
    try {
        const learnerId = req.user.id;
        const learner = await Learner.findById(learnerId);
        if (!learner) {
            return res.status(404).json({ message: 'Learner not found' });
        }
        res.status(200).json(learner);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateLearnerProfile = async (req, res) => {
    try {
        const learnerId = req.user.id;
        const { name, description, email, currentPassword, newPassword } = req.body;

        const learner = await Learner.findById(learnerId);
        if (!learner) {
            return res.status(404).json({ message: 'Learner not found' });
        }

        // Vérifier si l'email est différent et existe déjà
        if (email && email !== learner.email) {
            const existingEmail = await Learner.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            learner.email = email;
        }

        learner.name = name || learner.name;
        learner.description = description || learner.description;

        if (currentPassword && newPassword) {
            const isMatch = await comparePassword(currentPassword, learner.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            const hashedNewPassword = await hashPassword(newPassword);
            learner.password = hashedNewPassword;
        }

        await learner.save();

        res.status(200).json({ message: 'Learner profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:8072/api/instructor/courses`);

        const courses = response.data;

        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllLearners = async (req, res) => {
    try {
        const learners = await Learner.find();
        res.status(200).json(learners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.enrollCourse = async (req, res) => {
    try {
        const { learnerId, courseId } = req.body;

        const enrollment = new Enrollment({
            learnerId,
            course: courseId,
        });

        await enrollment.save();

        res.status(200).json({ message: 'Course enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getEnrollmentsByLearnerId = async (req, res) => {
    try {
        const { learnerId } = req.params;

        const enrollments = await Enrollment.find({ learnerId });

        res.status(200).json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.unenrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const learnerId = req.user.id;

        await Enrollment.deleteOne({ learnerId, course: courseId });

        res.status(200).json({ message: 'Unenrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateProgress = async (req, res) => {
    try {
        const { contentId, completed } = req.body;
        const learnerId = req.user.id;

        let enrollment = await Enrollment.findOne({ learnerId });
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        let progress = enrollment.progress.find(item => item.content_id === contentId);
        if (!progress) {
            enrollment.progress.push({ content_id: contentId, completed });
        } else {
            progress.completed = completed;
        }

        await enrollment.save();

        res.status(200).json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteLearner = async (req, res) => {
    try {
        const { learnerId } = req.params;

        await Learner.findByIdAndDelete(learnerId);

        res.status(200).json({ message: 'Learner deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getEnrollmentByCourseIdAndLearnerId = async (req, res) => {
    try {
        const { courseId, learnerId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: courseId,
            learnerId: learnerId,
        });

        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        const progressCount = enrollment.progress.length;

        console.log("Count" + progressCount);
        res.status(200).json({ enrollment, progressCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateLearnerByAdmin = async (req, res) => {
    try {
        const { learnerId } = req.params;
        const { name, email, description, password } = req.body;

        const learner = await Learner.findById(learnerId);
        if (!learner) {
            return res.status(404).json({ message: 'Learner not found' });
        }

        // vérifier si l'email est changé et existe déjà
        if (email && email !== learner.email) {
            const existingEmail = await Learner.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            learner.email = email;
        }

        learner.name = name || learner.name;
        learner.description = description || learner.description;

        // si le mot de passe est modifié, le hasher avant de sauvegarder
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            learner.password = hashedPassword;
        }

        await learner.save();

        res.status(200).json({ message: 'Learner updated successfully', learner });
    } catch (error) {
        console.error('Error updating learner by admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
