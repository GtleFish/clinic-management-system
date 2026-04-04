import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy loading
const Index            = lazy(() => import("./pages/Index"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const LoginPage        = lazy(() => import("./pages/LoginPage"));
const RegisterPage     = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const BookingPage      = lazy(() => import("./pages/BookingPage"));
const HistoryPage      = lazy(() => import("./pages/HistoryPage"));
const DepartmentsPage  = lazy(() => import("./pages/DepartmentsPage"));
const ProfilePage      = lazy(() => import("./pages/ProfilePage"));
const QuanLyTaiKhoan   = lazy(() => import("./pages/admin/QuanLyTaiKhoan"));
const QuanLyBenhNhan   = lazy(() => import("./pages/employee/QuanLyBenhNhan"));
const TaoLichKham      = lazy(() => import("./pages/employee/TaoLichKham"));
const QuanLyVanHanh    = lazy(() => import("./pages/admin/QuanLyVanHanh"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>

        <Suspense fallback={<div className="flex h-screen items-center justify-center">Đang tải...</div>}>
          <Routes>

            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-patient" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />

            {/* Bệnh nhân */}
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin */}
            <Route path="/admin/checkin" element={<QuanLyVanHanh />} />
            <Route path="/admin/doctors" element={<QuanLyTaiKhoan />} />
            <Route path="/admin/patients" element={<QuanLyBenhNhan />} />

            {/* Nhân viên */}
            <Route path="/employee/patients" element={<QuanLyBenhNhan />} />
            <Route path="/employee/appointments" element={<TaoLichKham />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;