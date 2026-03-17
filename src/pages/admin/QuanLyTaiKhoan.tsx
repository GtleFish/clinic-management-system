import { useState, useEffect, useCallback } from 'react';
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
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản Bác sĩ</h1>
          <p className="text-sm text-gray-500 mt-1">US-ADM-01 — Tạo và quản lý tài khoản nhân viên y tế</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Thêm bác sĩ
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên bác sĩ..."
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterKhoa}
          onChange={(e) => setFilterKhoa(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả khoa</option>
          {khoaList.map((k) => (
            <option key={k.idKhoa} value={k.idKhoa}>{k.tenKhoa}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Họ tên</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Chuyên khoa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Khoa</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kinh nghiệm</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">Đang tải...</td>
              </tr>
            ) : doctors.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">Chưa có bác sĩ nào</td>
              </tr>
            ) : (
              doctors.map((doc) => (
                <tr key={doc.idBacSi} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{doc.hoTen}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.chuyenKhoa}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {doc.tenKhoa}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.namKinhNghiem} năm</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="text-blue-600 hover:underline text-xs mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
            Tổng: {doctors.length} bác sĩ
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editData ? 'Cập nhật tài khoản bác sĩ' : 'Thêm bác sĩ mới'}
            </h2>
            <DoctorForm
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Modal hiển thị mật khẩu mặc định sau khi tạo */}
      {showDefaultPw && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Tài khoản đã được tạo</h2>
            <p className="text-sm text-gray-500 mb-4">
              Vui lòng thông báo thông tin đăng nhập cho bác sĩ:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2 mb-4">
              <div><span className="text-gray-500">Tên đăng nhập:</span> <strong>{showDefaultPw.username}</strong></div>
              <div><span className="text-gray-500">Mật khẩu:</span> <strong className="text-blue-600">{showDefaultPw.defaultPassword}</strong></div>
            </div>
            <p className="text-xs text-gray-400 mb-4">Bác sĩ nên đổi mật khẩu sau lần đăng nhập đầu tiên</p>
            <button
              onClick={() => setShowDefaultPw(null)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg text-sm text-white shadow-lg z-50
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}