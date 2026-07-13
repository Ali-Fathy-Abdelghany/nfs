import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// صفحات موجودة مباشرة داخل مجلد pages (حسب ما ظهر في الـ Explorer)
import Auth from "./pages/Auth";
import SelectionPage from "./pages/SelectionPage";
import DoctorSignup from "./pages/DoctorSignup";
import UserSignup from "./pages/UserSignup";
import Verification from "./pages/Verification";
import Dashboard from "./pages/Dashboard";
import DoctorCheckoutPage from "./pages/DoctorCheckoutPage";
import Payments from "./pages/Payments";
import Analysis from "./pages/Analysis";
import Chats from "./pages/Chats";
import Library from "./pages/Library";
import PatientProfile from "./pages/PatientProfile";

import Sessions from "./pages/Sessions";
import ProfileProgress from "./pages/ProfileProgress";

// صفحات موجودة داخل مجلدات فرعية داخل pages
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile";
import DoctorWork from "./pages/DoctorWork/DoctorWork";
import Patients from "./pages/Patients/Patients";
import Meetings from "./pages/Meetings/Meetings";

import TimeTable from "./pages/TimeTable/TimeTable";
import AdminPage from "./pages/Admin/AdminPage";

// مكونات أخرى
import QuizPage from "./Components/QuizPage/QuizPage";
import AllArticles from "./pages/AllArticles/AllArticles";
import AllReviews from "./pages/AllReviews/AllReviews";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/select-role" element={<SelectionPage />} />
                <Route path="/doctor-signup" element={<DoctorSignup />} />
                <Route path="/user-signup" element={<UserSignup />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminPage />} />

                <Route
                    path="/doctor-checkout"
                    element={<DoctorCheckoutPage />}
                />
                <Route path="/payments" element={<Payments />} />

                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/all-articles" element={<AllArticles />} />
                <Route path="/all-reviews" element={<AllReviews />} />
                <Route path="/profile-progress" element={<ProfileProgress />} />

                {/* مسارات الطبيب */}
                <Route path="/doctor/dashboard" element={<DoctorWork />} />
                <Route path="/doctor/profile" element={<DoctorProfile />} />
                <Route
                    path="/doctor/patient-profile"
                    element={<PatientProfile />}
                />
                <Route path="/doctor/patients" element={<Patients />} />
                <Route path="/doctor/meetings" element={<Meetings />} />
                <Route path="/doctor/sessions" element={<Sessions />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/doctor/timetable" element={<TimeTable />} />
                <Route path="/doctor/chats" element={<Chats />} />
                <Route path="/doctor/library" element={<Library />} />
                <Route path="/doctor/analysis" element={<Analysis />} />

                {/* مسارات التحويل */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;
