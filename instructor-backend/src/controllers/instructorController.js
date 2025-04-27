const bcrypt = require('bcrypt');
const Instructor = require('../models/InstructorModel');
const { hashPassword, generateToken, comparePassword } = require('../middleware/auth');
const Course = require('../models/CourseModel');
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
        res.status(500).json({ message: 'Internal Server Error' });
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
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Profil
exports.viewInstructorProfile = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.instructorId);
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        const { password, ...instructorData } = instructor.toObject();
        res.status(200).json(instructorData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateInstructorProfile = async (req, res) => {
    try {
        const { name, email, title, currentPassword, newPassword } = req.body;
        const instructor = await Instructor.findById(req.params.instructorId);

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        instructor.name = name || instructor.name;
        instructor.email = email || instructor.email;
        instructor.title = title || instructor.title;

        if (currentPassword && newPassword) {
            const isValid = await comparePassword(currentPassword, instructor.password);
            if (!isValid) {
                return res.status(400).json({ message: 'Current password incorrect' });
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

// Cours
exports.addNewCourse = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const instructorId = req.user.id;

        const newCourse = new Course({
            title,
            description,
            category,
            instructor: instructorId
        });

        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.addCourseContent = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, type } = req.body;
      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
  
      // Validate course exists (pseudo-code)
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
  
      // Save to database (example)
      const newContent = new CourseContent({
        courseId,
        title,
        type,
        filePath: `/uploads/${file.filename}`,
        instructorId: req.user.id,
        createdAt: new Date()
      });
  
      await newContent.save();
  
      res.status(201).json({
        success: true,
        message: 'Content added successfully',
        content: {
          id: newContent._id,
          title: newContent.title,
          type: newContent.type,
          fileUrl: newContent.filePath
        }
      });
  
    } catch (error) {
      console.error('Error adding content:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  };

exports.getAllCoursesByInstructorId = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.params.instructorId }).populate('instructor', 'name email');
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
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

exports.deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.courseId);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Admin
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.status(200).json(instructors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const deletedInstructor = await Instructor.findByIdAndDelete(req.params.instructorId);
        if (!deletedInstructor) {
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
