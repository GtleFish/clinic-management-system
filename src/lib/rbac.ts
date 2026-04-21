/**
 * RBAC — role & route map (mở rộng: thêm role vào Role / ROUTE_ACCESS).
 */

export type Role = "admin" | "nhanvien" | "bacsi" | "benhnhan";

const ROLE_ALIASES: Record<string, Role> = {
  admin: "admin",
  nhanvien: "nhanvien",
  nv: "nhanvien",
  bacsi: "bacsi",
  bs: "bacsi",
  benhnhan: "benhnhan",
  patient: "benhnhan",
};

const KNOWN: Role[] = ["admin", "nhanvien", "bacsi", "benhnhan"];

export function normalizeRole(role: string | undefined | null): Role | null {
  if (!role) return null;
  const key = String(role).trim().toLowerCase();
  if (ROLE_ALIASES[key]) return ROLE_ALIASES[key];
  if ((KNOWN as string[]).includes(key)) return key as Role;
  return null;
}

export interface StoredUser {
  idUser?: string;
  role?: string;
  username?: string;
  hoTen?: string;
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/** Trang mặc định sau đăng nhập theo role */
export function getDefaultPathForRole(role: string | undefined | null): string {
  const r = normalizeRole(role);
  switch (r) {
    case "admin":
      return "/admin";
    case "nhanvien":
      return "/employee/appointments";
    case "bacsi":
      return "/doctor/dashboard";
    case "benhnhan":
      return "/patient/dashboard";
    default:
      return "/";
  }
}

/** Admin được coi là có quyền trên mọi route đã đăng nhập */
export function isAdmin(role: Role | null): boolean {
  return role === "admin";
}

/** Kiểm tra role có nằm trong danh sách được phép không (admin luôn true) */
export function hasRole(userRole: Role | null, allowed: Role[]): boolean {
  if (!userRole) return false;
  if (userRole === "admin") return true;
  return allowed.includes(userRole);
}

/** Route công khai — không cần đăng nhập */
const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/register",
  "/register-patient",
  "/forgot-password",
  "/departments",
  "/booking",
  "/forbidden",
];

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

/**
 * Quyền truy cập theo prefix (ưu tiên khớp dài trước).
 * Mở rộng: thêm entry { prefix, roles }.
 */
const ROUTE_RULES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/employee", roles: ["nhanvien", "admin"] },
  { prefix: "/doctor", roles: ["bacsi", "admin"] },
  { prefix: "/patient", roles: ["benhnhan", "admin"] },
  { prefix: "/history", roles: ["benhnhan", "admin"] },
];

export function canAccessPath(userRole: Role | null, pathname: string): boolean {
  if (isPublicPath(pathname)) return true;
  if (!userRole) return false;
  if (userRole === "admin") return true;

  const rule = [...ROUTE_RULES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));

  if (!rule) {
    // Ví dụ /profile: mọi user đã đăng nhập
    return true;
  }
  return hasRole(userRole, rule.roles);
}