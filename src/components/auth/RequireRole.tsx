import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/lib/rbac";
import { getStoredUser, hasRole, normalizeRole } from "@/lib/rbac";

type Props = { allowedRoles: Role[] };

/**
 * Bảo vệ route theo role. Admin luôn được phép (xử lý trong hasRole).
 * Chưa đăng nhập → /login; sai role → /forbidden
 */
export default function RequireRole({ allowedRoles }: Props) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getStoredUser();
  const role = normalizeRole(user?.role);

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role || !hasRole(role, allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}