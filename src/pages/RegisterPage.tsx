import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { registerPatient } from "@/lib/apiPatient";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    hoTen: "",
    cccd: "",
    gioiTinh: "",
    ngaySinh: "",
    gmail: "",
    sdt: "",
    soBaoHiem: "",
    benhNen: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    try {

      const data = {
        hoTen: form.hoTen,
        cccd: form.cccd,
        gioiTinh: form.gioiTinh,
        ngaySinh: form.ngaySinh,
        gmail: form.gmail,
        sdt: form.sdt,
        soBaoHiem: form.soBaoHiem,
        benhNen: form.benhNen,
        password: form.password 
      };

      await registerPatient(data);

      alert("Đăng ký thành công! Vui lòng đăng nhập.");

      navigate("/login");

    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đăng ký thất bại");
      }
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold font-heading">
              Đăng ký bệnh nhân
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Nhập hồ sơ để đặt lịch khám
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Họ tên */}
            <div className="space-y-2">
              <Label>Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  placeholder="Nguyễn Văn A"
                  className="pl-10"
                  value={form.hoTen}
                  onChange={handleChange("hoTen")}
                  required
                />
              </div>
            </div>

            {/* CCCD */}
            <div className="space-y-2">
              <Label>CCCD</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  placeholder="0123456789"
                  className="pl-10"
                  value={form.cccd}
                  onChange={handleChange("cccd")}
                  required
                />
              </div>
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <Label>Giới tính</Label>
              <Select
                value={form.gioiTinh}
                onValueChange={(v) => setForm((prev) => ({ ...prev, gioiTinh: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Input
                type="date"
                value={form.ngaySinh}
                onChange={handleChange("ngaySinh")}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  type="email"
                  className="pl-10"
                  value={form.gmail}
                  onChange={handleChange("gmail")}
                />
              </div>
            </div>

            {/* SĐT */}
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  className="pl-10"
                  value={form.sdt}
                  onChange={handleChange("sdt")}
                  required
                />
              </div>
            </div>

            {/* Số bảo hiểm */}
            <div className="space-y-2">
              <Label>Số bảo hiểm</Label>
              <Input
                value={form.soBaoHiem}
                onChange={handleChange("soBaoHiem")}
              />
            </div>

            {/* Bệnh nền */}
            <div className="space-y-2">
              <Label>Bệnh nền</Label>
              <Input
                value={form.benhNen}
                onChange={handleChange("benhNen")}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label>Xác nhận mật khẩu</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
            >
              Đăng ký
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;