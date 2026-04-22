import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredUser } from "@/lib/rbac";

/** Chỉ user đã đăng nhập (có token + user) */
export default function RequireAuth() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}