import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getDefaultPathForRole, getStoredUser, normalizeRole } from "@/lib/rbac";

export default function Forbidden() {
  const user = getStoredUser();
  const role = normalizeRole(user?.role);
  const home = role ? getDefaultPathForRole(user?.role) : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elevated"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldOff className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bạn không có quyền xem trang này. Nếu cho rằng đây là lỗi, hãy liên hệ quản trị viên.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link to="/">Về trang chủ</Link>
          </Button>
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link to={home}>Đến khu vực của tôi</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}