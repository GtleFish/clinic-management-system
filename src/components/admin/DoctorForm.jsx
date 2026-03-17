import { useState, useEffect } from 'react';
import { getKhoa } from '../../services/adminService';

const EMPTY_FORM = {
  hoTen:          '',
  idKhoa:         '',
  chuyenKhoa:     '',
  namKinhNghiem:  '',
  username:       '',
  email:          '',
};

/**
 * Form tạo / chỉnh sửa tài khoản bác sĩ
 * Props:
 *   initialData  — dữ liệu ban đầu (khi edit), null khi tạo mới
 *   onSubmit     — function(data) xử lý submit
 *   onCancel     — function() đóng form
 *   loading      — boolean trạng thái đang gửi
 */
export default function DoctorForm({ initialData = null, onSubmit, onCancel, loading }) {
  const [form,   setForm]   = useState(initialData || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [khoaList, setKhoaList] = useState([]);

  const isEdit = Boolean(initialData);

  // Load danh sách khoa
  useEffect(() => {
    getKhoa()
      .then((res) => setKhoaList(res.data))
      .catch(() => setKhoaList([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi user bắt đầu sửa
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Validation phía client (AC2) ──────────────────────────
  const validate = () => {
    const errs = {};

    if (!form.hoTen.trim())      errs.hoTen      = 'Họ tên không được để trống';
    if (!form.idKhoa)            errs.idKhoa     = 'Vui lòng chọn khoa';
    if (!form.chuyenKhoa.trim()) errs.chuyenKhoa = 'Chuyên khoa không được để trống';

    if (form.namKinhNghiem === '') {
      errs.namKinhNghiem = 'Năm kinh nghiệm không được để trống';
    } else if (isNaN(form.namKinhNghiem) || Number(form.namKinhNghiem) < 0) {
      errs.namKinhNghiem = 'Năm kinh nghiệm phải là số không âm';
    }

    if (!isEdit) {
      // username chỉ bắt buộc khi tạo mới
      if (!form.username.trim()) {
        errs.username = 'Tên đăng nhập không được để trống';
      } else if (form.username.length < 3) {
        errs.username = 'Tên đăng nhập tối thiểu 3 ký tự';
      }
    }

    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errs.email = 'Email không đúng định dạng';
      }
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Họ tên */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ tên <span className="text-red-500">*</span>
        </label>
        <input
          name="hoTen"
          value={form.hoTen}
          onChange={handleChange}
          placeholder="VD: BS. Nguyễn Văn An"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.hoTen ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.hoTen && <p className="text-red-500 text-xs mt-1">{errors.hoTen}</p>}
      </div>

      {/* Khoa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Khoa <span className="text-red-500">*</span>
        </label>
        <select
          name="idKhoa"
          value={form.idKhoa}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.idKhoa ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">-- Chọn khoa --</option>
          {khoaList.map((k) => (
            <option key={k.idKhoa} value={k.idKhoa}>{k.tenKhoa}</option>
          ))}
        </select>
        {errors.idKhoa && <p className="text-red-500 text-xs mt-1">{errors.idKhoa}</p>}
      </div>

      {/* Chuyên khoa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chuyên khoa <span className="text-red-500">*</span>
        </label>
        <input
          name="chuyenKhoa"
          value={form.chuyenKhoa}
          onChange={handleChange}
          placeholder="VD: Tim mạch can thiệp"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.chuyenKhoa ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.chuyenKhoa && <p className="text-red-500 text-xs mt-1">{errors.chuyenKhoa}</p>}
      </div>

      {/* Năm kinh nghiệm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Năm kinh nghiệm <span className="text-red-500">*</span>
        </label>
        <input
          name="namKinhNghiem"
          type="number"
          min="0"
          value={form.namKinhNghiem}
          onChange={handleChange}
          placeholder="VD: 5"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.namKinhNghiem ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.namKinhNghiem && <p className="text-red-500 text-xs mt-1">{errors.namKinhNghiem}</p>}
      </div>

      {/* Username — chỉ hiện khi tạo mới */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên đăng nhập <span className="text-red-500">*</span>
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="VD: bs_nguyenvanan"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.username
            ? <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            : <p className="text-gray-400 text-xs mt-1">Mật khẩu mặc định sẽ được tạo tự động</p>
          }
        </div>
      )}

      {/* Email (tuỳ chọn) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="VD: bsnguyenvanan@clinic.vn"
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}