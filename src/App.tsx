import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import BookingPage from "./pages/BookingPage";
import HistoryPage from "./pages/HistoryPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ProfilePage from "./pages/ProfilePage";
import Forbidden from "./pages/Forbidden";

import QuanLyTaiKhoan from "./pages/admin/QuanLyTaiKhoan";
import QuanLyBenhNhan from "./pages/employee/QuanLyBenhNhan";
import TaoLichKham from "./pages/employee/TaoLichKham";
import QuanLyVanHanh from "./pages/admin/QuanLyVanHanh";
import AdminDashboard from "./pages/admin/AdminDashboard";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorExamination from "./pages/doctor/DoctorExamination";
import DoctorPatientList from "./pages/doctor/DoctorPatientList";
import DoctorProfile from "./pages/doctor/DoctorProfile";

import PatientDashboard from "./pages/patient/PatientDashboard";
import LichSuKham from "./pages/patient/LichSuKham";

import RequireAuth from "./components/auth/RequireAuth";
import RequireRole from "./components/auth/RequireRole";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Công khai */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-patient" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Đã đăng nhập — ví dụ hồ sơ (mọi role) */}
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route element={<RequireRole allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<QuanLyTaiKhoan />} />
            <Route path="/admin/patients" element={<QuanLyBenhNhan />} />
            <Route path="/admin/checkin" element={<QuanLyVanHanh />} />
          </Route>

          {/* Nhân viên */}
          <Route element={<RequireRole allowedRoles={["nhanvien", "admin"]} />}>
            <Route path="/employee/patients" element={<QuanLyBenhNhan />} />
            <Route path="/employee/appointments" element={<TaoLichKham />} />
          </Route>

          {/* Bác sĩ */}
          <Route element={<RequireRole allowedRoles={["bacsi", "admin"]} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/examination" element={<DoctorExamination />} />
            <Route path="/doctor/patients" element={<DoctorPatientList />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>

          {/* Bệnh nhân */}
          <Route element={<RequireRole allowedRoles={["benhnhan", "admin"]} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/lich-su-kham" element={<LichSuKham />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
