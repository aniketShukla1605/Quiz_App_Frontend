import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import MainLayout from "../layout/MainLayout";
import DashboardLayout from "../layout/DashboardLayout";

// Guards
import ProtectedRoute from "../components/common/ProtectedRoutes";

// Public pages
import LandingPage from "../pages/shared/LandingPage";
import LoginPage from "../pages/auth/login";
import RegisterPage from "../pages/auth/register";
import NotFound from "../pages/shared/NotFound";

// Shared protected
import ProfilePage from "../pages/shared/ProfilePage";

// Student pages
import StudentDashboard from "../pages/student/Dashboard";
import QuizList from "../pages/student/QuizList";
import QuizInstructions from "../pages/student/QuizInstructions";
import QuizPage from "../pages/student/QuizPage";
import ResultPage from "../pages/student/ResultPage";
import HistoryPage from "../pages/student/HistoryPage";
import AnalyticsPage from "../pages/student/AnalyticsPage";

// Teacher pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import CreateQuiz from "../pages/teacher/CreateQuiz";
import CreateCustomQuiz from "../pages/teacher/CreateCustomQuiz";
import QuestionBank from "../pages/teacher/QuestionBank";
import Leaderboard from "../pages/teacher/Leaderboard";

// Smart home redirect: logged-in users go to their dashboard
function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === "TEACHER") return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected shared */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<ProfilePage />} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/quizzes" element={<QuizList />} />
        <Route path="/student/quiz/:id/instructions" element={<QuizInstructions />} />
        <Route path="/student/quiz/:id" element={<QuizPage />} />
        <Route path="/student/quiz/:id/result" element={<ResultPage />} />
        <Route path="/student/history" element={<HistoryPage />} />
        <Route path="/student/analytics" element={<AnalyticsPage />} />

        {/* Teacher routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/create-quiz" element={<CreateQuiz />} />
        <Route path="/teacher/create-custom" element={<CreateCustomQuiz />} />
        <Route path="/teacher/questions" element={<QuestionBank />} />
        <Route path="/teacher/leaderboard" element={<Leaderboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}