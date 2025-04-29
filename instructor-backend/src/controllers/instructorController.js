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

        // Assurez-vous que _id est bien inclus
        const { password, ...instructorData } = instructor.toObject();
        res.status(200).json({ 
            token, 
            user: {
                ...instructorData,
                _id: instructor._id // Explicitement inclus au cas où
            } 
        });
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
            instructor: instructorId,
        });

        const savedCourse = await newCourse.save();

        // Vérification que l'update a bien fonctionné
        const updatedInstructor = await Instructor.findByIdAndUpdate(
            instructorId,
            { $push: { courses: savedCourse._id } },
            { new: true }
        );

        if (!updatedInstructor) {
            console.error('Instructor not found during course addition');
        }

        res.status(201).json(savedCourse);
    } catch (err) {
        console.error('Error in addNewCourse:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.addCourseContent = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
  
      const { courseId } = req.params;
      const { title, type } = req.body;
      
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
  
      // Vérification de l'instructeur
      if (course.instructor.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
  
      // Création du chemin relatif
      const filePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      const url = `/uploads/${filePath}`;
  
      const newContent = {
        title,
        doc_type: type,
        url,
        completed: false
      };
  
      course.content.push(newContent);
      await course.save();
  
      res.status(201).json({
        success: true,
        message: 'Content added successfully',
        content: newContent
      });
  
    } catch (error) {
      console.error('Error:', error);
      
      // Supprimer le fichier uploadé en cas d'erreur
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
  
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
exports.getAllCoursesByInstructorId = async (req, res) => {
    try {
        // Option 1: Get courses directly from Course collection
        const courses = await Course.find({ instructor: req.params.instructorId })
            .populate('instructor', 'name email');

        // Option 2: Get courses through Instructor population
        // const instructor = await Instructor.findById(req.params.instructorId).populate('courses');
        // const courses = instructor.courses;

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
        const courses = await Course.find().populate('instructor', 'name email title');
        res.status(200).json(courses);
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

exports.updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, category } = req.body;
        const instructorId = req.user.id;

        // Verify the course belongs to the instructor
        const course = await Course.findOne({ 
            _id: courseId, 
            instructor: instructorId 
        });

        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: 'Course not found or not authorized' 
            });
        }

        // Update course fields
        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.updatedAt = new Date();

        const updatedCourse = await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse
        });
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const instructorId = req.user.id;

        // Verify the course belongs to the instructor
        const course = await Course.findOne({ 
            _id: courseId, 
            instructor: instructorId 
        });

        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: 'Course not found or not authorized' 
            });
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        // Remove course reference from instructor
        await Instructor.findByIdAndUpdate(
            instructorId,
            { $pull: { courses: courseId } }
        );

        res.status(200).json({ 
            success: true,
            message: 'Course deleted successfully' 
        });
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};
exports.adminDeleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Cours introuvable'
            });
        }

        await Course.findByIdAndDelete(courseId);

        // Supprimer la référence dans le modèle Instructor
        await Instructor.findByIdAndUpdate(course.instructor, {
            $pull: { courses: courseId }
        });

        res.status(200).json({
            success: true,
            message: 'Course successfully deleted by admin'
        });
    } catch (error) {
        console.error('Error deleting course :', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting course'
        });
    }
};
