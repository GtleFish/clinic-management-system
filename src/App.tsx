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

import QuanLyTaiKhoan from "./pages/admin/QuanLyTaiKhoan";
import QuanLyBenhNhan from "./pages/employee/QuanLyBenhNhan";
import TaoLichKham    from "./pages/employee/TaoLichKham";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                      element={<Index />} />
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/register"              element={<RegisterPage />} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/departments"           element={<DepartmentsPage />} />

          {/* Bệnh nhân */}
          <Route path="/booking"               element={<BookingPage />} />
          <Route path="/history"               element={<HistoryPage />} />
          <Route path="/profile"               element={<ProfilePage />} />

          {/* Admin */}
          <Route path="/admin/doctors"         element={<QuanLyTaiKhoan />} />

          {/* Nhân viên */}
          <Route path="/employee/patients"     element={<QuanLyBenhNhan />} />
          <Route path="/employee/appointments" element={<TaoLichKham />} />

          {/* 404 — luôn đặt cuối */}
          <Route path="*"                      element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;