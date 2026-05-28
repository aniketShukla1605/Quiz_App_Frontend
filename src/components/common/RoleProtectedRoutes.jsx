import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

export default function RoleProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    const fallback =
      user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}