const bcrypt = require('bcrypt');
const Instructor = require('../models/InstructorModel');
const { hashPassword, generateToken, comparePassword } = require('../middleware/auth');
const Course = require('../models/CourseModel');
const fs = require('fs');
const path = require('path');

exports.signupInstructor = async (req, res) => {
    try {
        const existingInstructor = await Instructor.findOne({ email: req.body.email });
        if (existingInstructor) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await hashPassword(req.body.password);

        const newInstructor = new Instructor({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            title: req.body.title
        });

        await newInstructor.save();

        const token = generateToken(newInstructor);

        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.loginInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findOne({ email: req.body.email });
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const isValidPassword = await comparePassword(req.body.password, instructor.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(instructor);
        res.status(200).json({ token, id: instructor._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();  // Recherche tous les instructeurs dans la base de données
        res.status(200).json(instructors);  // Renvoie les instructeurs trouvés
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const instructor = await Instructor.findByIdAndDelete(instructorId);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ message: 'Instructor deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createInstructor = async (req, res) => {
    try {
        const existingInstructor = await Instructor.findOne({ email: req.body.email });
        if (existingInstructor) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10); 

        const newInstructor = new Instructor({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            title: req.body.title
        });

        await newInstructor.save();

        res.status(201).json({ message: 'Instructor created successfully', instructorId: newInstructor._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.viewInstructorProfile = async (req, res) => {
    try {
        const instructorId = req.params.instructorId;
        const instructor = await Instructor.findById(instructorId);

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        console.log('Fetched profile:', instructor);

        const { password, ...instructorData } = instructor.toObject();

        res.status(200).json(instructorData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateInstructorProfile = async (req, res) => {
    try {
        const instructorId = req.params.instructorId;
        const { name, email, title, currentPassword, newPassword } = req.body;

        const instructor = await Instructor.findById(instructorId);

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        // Mettre à jour les champs classiques
        instructor.name = name || instructor.name;
        instructor.email = email || instructor.email;
        instructor.title = title || instructor.title;

        // Si l'utilisateur souhaite changer son mot de passe
        if (currentPassword && newPassword) {
            const isPasswordValid = await comparePassword(currentPassword, instructor.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            instructor.password = await hashPassword(newPassword);
        }

        await instructor.save();

        const { password, ...updatedData } = instructor.toObject();
        res.status(200).json(updatedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.addNewCourse = async (req, res) => {
    try {
        const { title, description, requirements, price } = req.body;
        const instructorId = req.user.id;

        const newCourse = new Course({
            title,
            description,
            instructor: instructorId
        });

        if (req.files) {
            const files = req.files;

            const content = [];
            for (let file of files) {
                const fileExtension = path.extname(file.originalname);
                const fileName = `${Date.now()}${fileExtension}`;
                const fileUrl = `/uploads/${file.filename}`;
                content.push({
                    title: file.originalname,
                    doc_type: file.mimetype.split('/')[0],
                    url: fileUrl
                });
            }

            newCourse.content = content;
        }

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllCoursesByInstructorId = async (req, res) => {
    try {
        const instructorId = req.params.instructorId;
        const courses = await Course.find({ instructor: instructorId }).populate('instructor', 'name email');

        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.addCourseContent = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const { title, file, doc_type } = req.body;

        if (!title || !file || !doc_type) {
            return res.status(400).json({ message: 'Title, file URL, and doc_type are required' });
        }

        course.content.push({
            title,
            url: file,
            doc_type
        });

        await course.save();

        res.status(201).json({ message: 'Content added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Trouver et supprimer le cours dans la base de données
        const deletedCourse = await Course.findByIdAndDelete(courseId);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateCourseStatus = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { status } = req.body;
        
        const course = await Course.findByIdAndUpdate(courseId, { status }, { new: true });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
