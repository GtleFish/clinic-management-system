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

import QuanLyTaiKhoan from './pages/admin/QuanLyTaiKhoan';
import QuanLyBenhNhan from './pages/employee/QuanLyBenhNhan';
import TaoLichKham    from './pages/employee/TaoLichKham';
import QuanLyVanHanh from './pages/admin/QuanLyVanHanh';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Các Route dành cho Bệnh nhân */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          
          {/* Sửa lại lỗi Route bị tuột ra ngoài */}
          <Route path="/register-patient" element={<RegisterPage />} />

          {/* Các Route dành cho Admin */}
          <Route path="/admin/doctors" element={<QuanLyTaiKhoan />} />
          {/* Thêm Route Quản lý bệnh nhân vào trang Admin (tái sử dụng component của Employee) */}
          <Route path="/admin/patients" element={<QuanLyBenhNhan />} />

          <Route path="/admin/checkin" element={<QuanLyVanHanh />} />
          {/* Các Route dành cho Nhân viên/Lễ tân */}
          <Route path="/employee/patients"     element={<QuanLyBenhNhan />} />
          <Route path="/employee/appointments" element={<TaoLichKham />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;