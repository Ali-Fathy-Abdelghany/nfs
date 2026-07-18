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
import NfsAssistant from "./pages/NfsAssistant";
import NfsAssistantWidget from "./components/NfsAssistantWidget";

import Sessions from "./pages/Sessions";
import ProfileProgress from "./pages/ProfileProgress";
import About from "./pages/About";

// صفحات موجودة داخل مجلدات فرعية داخل pages
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile";
import DoctorWork from "./pages/DoctorWork/DoctorWork";
import Patients from "./pages/Patients/Patients";
import Meetings from "./pages/Meetings/Meetings";
import DigitalClinic from "./pages/DigitalClinic/DigitalClinic";

import TimeTable from "./pages/TimeTable/TimeTable";
import AdminPage from "./pages/Admin/AdminPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// مكونات أخرى
import QuizPage from "./Components/QuizPage/QuizPage";
import AllArticles from "./pages/AllArticles/AllArticles";
import AllReviews from "./pages/AllReviews/AllReviews";
import { useAuth } from "./context/AuthContext";
import { AuthGateProvider } from "./context/AuthGateContext";
import { getRoleHomePath } from "./api/config";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function LandingOrHome() {
    const { isAuthenticated } = useAuth() || {};
    if (!isAuthenticated) return <Dashboard />;
    const role = localStorage.getItem("userRole");
    const home = getRoleHomePath(role, { isAuthenticated: true });
    if (home === "/dashboard") return <Dashboard />;
    return <Navigate to={home} replace />;
}

function AppRoutes() {
    const { user, isAuthenticated } = useAuth() || {};
    // Remount the floating widget on every account change so the previous
    // user's in-memory chat cannot leak into the next session.
    const widgetUserKey = isAuthenticated
        ? String(user?.userId ?? user?.id ?? "user")
        : "anonymous";

    return (
        <Router>
            <AuthGateProvider>
                <Routes>
                    <Route path="/" element={<LandingOrHome />} />
                    <Route path="/login" element={<Auth />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/select-role" element={<SelectionPage />} />
                    <Route path="/doctor-signup" element={<DoctorSignup />} />
                    <Route path="/user-signup" element={<UserSignup />} />
                    <Route path="/verification" element={<Verification />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/nfs-assistant" element={<NfsAssistant />} />
                    <Route path="/admin" element={<AdminPage />} />

                    <Route
                        path="/doctor-checkout"
                        element={
                            <ProtectedRoute title="الحجز يحتاج حساب" message="سجّل الدخول أو أنشئ حساب عشان تكمل حجز جلستك.">
                                <DoctorCheckoutPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/payments" element={
                        <ProtectedRoute title="الدفع الآمن" message="سجّل الدخول عشان تكمل عملية الدفع وتحجز جلستك.">
                            <Payments />
                        </ProtectedRoute>
                    } />

                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/all-articles" element={<AllArticles />} />
                    <Route path="/all-reviews" element={<AllReviews />} />
                    <Route path="/profile-progress" element={
                        <ProtectedRoute title="حسابك بانتظارك" message="سجّل الدخول عشان تشوف تقدمك وإحصائيات رحلتك النفسية.">
                            <ProfileProgress />
                        </ProtectedRoute>
                    } />

                    {/* مسارات الطبيب */}
                    <Route path="/doctor/dashboard" element={<DoctorWork />} />
                    <Route path="/doctor/profile" element={<DoctorProfile />} />
                    <Route
                        path="/doctor/patient-profile"
                        element={<PatientProfile />}
                    />
                    <Route path="/doctor/patients" element={<Patients />} />
                    {/* Call UIs: fullscreen video shells (no doctor Sidebar) */}
                    <Route path="/doctor/meetings" element={
                        <ProtectedRoute title="العيادة الرقمية" message="سجّل الدخول للوصول إلى جلسة الفيديو الخاصة بك.">
                            <Meetings />
                        </ProtectedRoute>
                    } />
                    <Route path="/digital-clinic" element={
                        <ProtectedRoute title="العيادة الرقمية" message="سجّل الدخول للوصول إلى جلسة الفيديو الخاصة بك.">
                            <DigitalClinic />
                        </ProtectedRoute>
                    } />
                    <Route path="/session/call" element={
                        <ProtectedRoute title="العيادة الرقمية" message="سجّل الدخول للوصول إلى جلسة الفيديو الخاصة بك.">
                            <DigitalClinic />
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/sessions" element={
                        <ProtectedRoute title="جلسات الطبيب" message="سجّل الدخول للوصول إلى جدول جلساتك.">
                            <Sessions />
                        </ProtectedRoute>
                    } />
                    <Route path="/sessions" element={
                        <ProtectedRoute title="جلساتك الخاصة" message="سجّل الدخول عشان تشوف مواعيدك وتدخل جلساتك المحجوزة.">
                            <Sessions />
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/timetable" element={<TimeTable />} />
                    <Route path="/doctor/chats" element={
                        <ProtectedRoute title="المحادثات لأعضاء نفس" message="سجّل الدخول عشان تدخل دوائر الدعم وتشارك بأمان.">
                            <Chats />
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor/library" element={<Library />} />
                    <Route path="/doctor/analysis" element={<Analysis />} />

                    {/* مسارات التحويل */}
                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
                <NfsAssistantWidget key={`nfs-assistant-widget-${widgetUserKey}`} />
            </AuthGateProvider>
        </Router>
    );
}

function App() {
    return <AppRoutes />;
}

export default App;
