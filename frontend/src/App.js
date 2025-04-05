import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PaymentComponent from './components/payment/payment';
import SubmitTicketForm from './components/support/submitTicket/submitTicketForm.js';
import HoverRating from './components/feedback/muiFeedback.js'
import CheckoutForm from './components/payment/checkoutForm.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Login from "./Main/Login";
import InstructorHome from "./Instructor/Pages/InstructorHome";
import LearnerHome from "./Learner/Pages/LearnerHome";
import AdminHome from "./Admin/Pages/AdminHome";
import Signup from "./Main/Signup";
import Home from "./Main/Home";

// Importation du composant AddCourse
import AddCourse from './Instructor/Pages/InstructorAddCourses.js';  // Ajoute ce chemin si tu as un fichier AddCourse.js

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/submit" element={<SubmitTicketForm />} />
                    <Route path="/payment" element={<PaymentComponent />} />
                    <Route path="/emoji" element={<HoverRating />} />
                    <Route path="/checkout" element={<CheckoutForm />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/instructor/home" element={<InstructorHome />} />
                    <Route path="/learner/home" element={<LearnerHome />} />
                    <Route path="/admin/home" element={<AdminHome />} />
                    <Route path="/feedback" element={<HoverRating />} />

                    {/* Ajout de la route pour la page Ajouter un Cours */}
                    <Route path="/add-course" element={<AddCourse />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
