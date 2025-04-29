import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Main Components
import Home from "./Main/Home";
import Login from "./Main/Login";
import Signup from "./Main/Signup";
import HoverRating from './components/feedback/muiFeedback';

// Admin Components
import AdminHome from "./Admin/Pages/AdminHome";
import AdminAllInstructors from "./Admin/Components/AdminAllInstructors";
import AdminAllStudents from "./Admin/Components/AdminAllStudents";

// Learner Components
import LearnerHome from "./Learner/Pages/LearnerHome";
import LearnerMyCourses from "./Learner/Components/LearnerMyCourses";

// Instructor Components
import InstructorHome from "./Instructor/Pages/InstructorHome";
import InstructorCoursesList from './Instructor/Pages/Courses/InstructorCoursesList';
import AddCourse from './Instructor/Pages/Courses/AddCourse';
import CourseDetails from './Instructor/Pages/Courses/CourseDetails';
import AddCourseContent from './Instructor/Pages/Courses/AddCourseContent';
import InstructorProfile from "./Instructor/Pages/InstructorProfile";
import EditCoursePage  from './Instructor/Pages/Courses/EditCoursePage';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/feedback" element={<HoverRating />} />

          {/* Admin Routes */}
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/instructors" element={<AdminAllInstructors />} />
          <Route path="/admin/students" element={<AdminAllStudents />} />

          {/* Learner Routes */}
          <Route path="/learner/home" element={<LearnerHome />} />
          <Route path="/learner/my-courses" element={<LearnerMyCourses />} />

          {/* Instructor Routes */}
          <Route path="/instructor/home" element={<InstructorHome />} />
          <Route path="/instructor/courses" element={<InstructorCoursesList />} />
          <Route path="/instructor/courses/add" element={<AddCourse />} />
          <Route path="/instructor/courses/:courseId" element={<CourseDetails />} />
          <Route path="/instructor/courses/:courseId/add-content" element={<AddCourseContent />} />
          <Route path="/instructor/profile" element={<InstructorProfile />} />
          <Route path="/instructor/courses/:courseId/edit" element={<EditCoursePage />} />

          {/* Fallback Route */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;