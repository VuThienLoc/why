import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const hasPersistedUser = typeof window !== "undefined" ? localStorage.getItem("limsUser") : null;

  if (loading || (!user && hasPersistedUser)) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !user.role.some(r => allowedRoles.includes(r))) {
    return <Navigate to="/" replace />; 
  }

  return <>{children}</>;
}
