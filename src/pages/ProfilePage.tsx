import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updatePatient, changePassword, getMyProfile } from "@/lib/apiPatient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ProfilePage = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [profile, setProfile] = useState({
    hoTen: "",
    cccd: "",
    gioiTinh: "",
    ngaySinh: "",
    gmail: "",
    sdt: "",
    soBaoHiem: "",
    benhNen: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error("Không thể tải thông tin:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePasswordChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePatient(user?.idUser, profile);
      alert("Cập nhật hồ sơ thành công!");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    try {
      await changePassword(user?.idUser, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      alert("Đổi mật khẩu thành công!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl"
        >
          {/* Avatar + tên */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold">
                {profile.hoTen ? profile.hoTen.charAt(0).toUpperCase() : <User size={36} />}
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-white shadow">
                <Camera size={14} />
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold font-heading">
                {profile.hoTen || "Bệnh nhân"}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.username}</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="profile">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="profile" className="flex-1 gap-2">
                <User size={15} /> Hồ sơ cá nhân
              </TabsTrigger>
              <TabsTrigger value="password" className="flex-1 gap-2">
                <Lock size={15} /> Đổi mật khẩu
              </TabsTrigger>
            </TabsList>

            {/* Tab Hồ sơ */}
            <TabsContent value="profile">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <form onSubmit={handleSaveProfile} className="space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Họ và tên</Label>
                      <Input
                        value={profile.hoTen}
                        onChange={handleProfileChange("hoTen")}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>CCCD</Label>
                      <Input
                        value={profile.cccd}
                        onChange={handleProfileChange("cccd")}
                        placeholder="0123456789"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Giới tính</Label>
                      <Input
                        value={profile.gioiTinh}
                        onChange={handleProfileChange("gioiTinh")}
                        placeholder="Nam / Nữ"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Ngày sinh</Label>
                      <Input
                        type="date"
                        value={profile.ngaySinh}
                        onChange={handleProfileChange("ngaySinh")}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input
                        value={profile.sdt}
                        onChange={handleProfileChange("sdt")}
                        placeholder="0901234567"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={profile.gmail}
                        onChange={handleProfileChange("gmail")}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Số bảo hiểm</Label>
                      <Input
                        value={profile.soBaoHiem}
                        onChange={handleProfileChange("soBaoHiem")}
                        placeholder="BH123456"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bệnh nền</Label>
                      <Input
                        value={profile.benhNen}
                        onChange={handleProfileChange("benhNen")}
                        placeholder="Tiểu đường, huyết áp..."
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary text-primary-foreground gap-2"
                    disabled={loading}
                  >
                    <Save size={16} />
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Tab Đổi mật khẩu */}
            <TabsContent value="password">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <form onSubmit={handleChangePassword} className="space-y-4">

                  {/* Mật khẩu cũ */}
                  <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordChange("oldPassword")}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange("newPassword")}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu mới */}
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange("confirmPassword")}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Gợi ý mật khẩu mạnh */}
                  <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Mật khẩu mạnh cần có:</p>
                    <p className={passwordForm.newPassword.length >= 6 ? "text-green-600" : ""}>
                      {passwordForm.newPassword.length >= 6 ? "✓" : "•"} Ít nhất 6 ký tự
                    </p>
                    <p className={/[A-Z]/.test(passwordForm.newPassword) ? "text-green-600" : ""}>
                      {/[A-Z]/.test(passwordForm.newPassword) ? "✓" : "•"} Có chữ hoa
                    </p>
                    <p className={/[0-9]/.test(passwordForm.newPassword) ? "text-green-600" : ""}>
                      {/[0-9]/.test(passwordForm.newPassword) ? "✓" : "•"} Có số
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary text-primary-foreground gap-2"
                    disabled={loading}
                  >
                    <Lock size={16} />
                    {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;