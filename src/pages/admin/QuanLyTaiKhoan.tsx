import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Search, UserCog, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DoctorForm from '../../components/admin/DoctorForm';
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getKhoa,
} from '../../services/adminService';

export default function QuanLyTaiKhoan() {
  const [doctors,     setDoctors]     = useState([]);
  const [khoaList,    setKhoaList]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [editData,    setEditData]    = useState(null);  // null = tạo mới
  const [search,      setSearch]      = useState('');
  const [filterKhoa,  setFilterKhoa]  = useState('');
  const [toast,       setToast]       = useState(null); // { type, message }
  const [showDefaultPw, setShowDefaultPw] = useState(null); // mật khẩu mặc định sau khi tạo

  // ── Fetch dữ liệu ─────────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDoctors({ search, idKhoa: filterKhoa });
      setDoctors(res.data);
    } catch {
      showToast('error', 'Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  }, [search, filterKhoa]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  useEffect(() => {
    getKhoa().then((res) => setKhoaList(res.data)).catch(() => {});
  }, []);

  // ── Toast helper ──────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditData(doctor);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditData(null);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editData) {
        // Cập nhật
        await updateDoctor(editData.idBacSi, formData);
        showToast('success', 'Cập nhật tài khoản bác sĩ thành công');
      } else {
        // Tạo mới (AC1)
        const res = await createDoctor(formData);
        showToast('success', 'Tạo tài khoản bác sĩ thành công');
        setShowDefaultPw({
          username:        formData.username,
          defaultPassword: res.defaultPassword,
        });
      }
      handleCloseForm();
      fetchDoctors();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        showToast('error', serverErrors.join(' | '));
      } else {
        showToast('error', msg);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Xóa tài khoản bác sĩ "${doctor.hoTen}"?`)) return;
    try {
      await deleteDoctor(doctor.idBacSi);
      showToast('success', 'Xóa tài khoản thành công');
      fetchDoctors();
    } catch {
      showToast('error', 'Không thể xóa tài khoản này');
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Activity className="h-3.5 w-3.5" /> US-ADM-01
            </div>
            <h1 className="text-3xl font-bold font-heading text-primary">Quản lý tài khoản bác sĩ</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tạo và quản lý tài khoản nhân viên y tế trong hệ thống.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gradient-primary text-primary-foreground gap-2 shadow-hero">
            <Plus className="h-4 w-4" /> Thêm bác sĩ
          </Button>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-5 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bác sĩ..."
              className="pl-9"
            />
          </div>
          <select
            value={filterKhoa}
            onChange={(e) => setFilterKhoa(e.target.value)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Tất cả khoa</option>
            {khoaList.map((k) => (
              <option key={k.idKhoa} value={k.idKhoa}>{k.tenKhoa}</option>
            ))}
          </select>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
        >
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Chuyên khoa</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Khoa</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kinh nghiệm</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">Đang tải...</td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    Chưa có bác sĩ nào
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.idBacSi} className="border-b border-border transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{doc.hoTen}</td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.chuyenKhoa}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        {doc.tenKhoa}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.namKinhNghiem} năm</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(doc)} className="mr-1 text-primary">
                        Sửa
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} className="text-destructive">
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && (
            <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              Tổng: {doctors.length} bác sĩ
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-elevated"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold font-heading">
                  <UserCog className="h-5 w-5 text-primary" />
                  {editData ? 'Cập nhật tài khoản bác sĩ' : 'Thêm bác sĩ mới'}
                </h2>
                <button onClick={handleCloseForm} className="rounded-md p-1.5 hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DoctorForm
                initialData={editData}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
                loading={formLoading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal hiển thị mật khẩu mặc định sau khi tạo */}
      <AnimatePresence>
        {showDefaultPw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-elevated"
            >
              <div className="mb-3 text-4xl">🔑</div>
              <h2 className="mb-2 text-lg font-semibold font-heading">Tài khoản đã được tạo</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Vui lòng thông báo thông tin đăng nhập cho bác sĩ:
              </p>
              <div className="mb-4 space-y-2 rounded-lg border border-border bg-background p-4 text-left text-sm">
                <div><span className="text-muted-foreground">Tên đăng nhập:</span> <strong>{showDefaultPw.username}</strong></div>
                <div><span className="text-muted-foreground">Mật khẩu:</span> <strong className="text-primary">{showDefaultPw.defaultPassword}</strong></div>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">Bác sĩ nên đổi mật khẩu sau lần đăng nhập đầu tiên</p>
              <Button onClick={() => setShowDefaultPw(null)} className="w-full gradient-primary text-primary-foreground">
                Đã hiểu
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 text-sm text-white shadow-elevated ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
            }`}
          >
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}