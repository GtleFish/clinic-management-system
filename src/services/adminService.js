import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Tự động đính kèm token vào mọi request
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Doctor ─────────────────────────────────────────────────

/**
 * Lấy danh sách bác sĩ
 * @param {Object} params - { search, idKhoa }
 */
export const getDoctors = (params = {}) =>
  api.get('/admin/doctors', { params }).then((r) => r.data);

/**
 * Lấy chi tiết 1 bác sĩ
 */
export const getDoctorById = (idBacSi) =>
  api.get(`/admin/doctors/${idBacSi}`).then((r) => r.data);

/**
 * Tạo tài khoản bác sĩ mới (AC1)
 * @param {Object} data - { hoTen, idKhoa, chuyenKhoa, namKinhNghiem, username, email }
 */
export const createDoctor = (data) =>
  api.post('/admin/doctors', data).then((r) => r.data);

/**
 * Cập nhật thông tin bác sĩ
 */
export const updateDoctor = (idBacSi, data) =>
  api.put(`/admin/doctors/${idBacSi}`, data).then((r) => r.data);

/**
 * Xóa tài khoản bác sĩ
 */
export const deleteDoctor = (idBacSi) =>
  api.delete(`/admin/doctors/${idBacSi}`).then((r) => r.data);

// ── Khoa ───────────────────────────────────────────────────

/**
 * Lấy danh sách khoa cho dropdown
 */
export const getKhoa = () =>
  api.get('/admin/khoa').then((r) => r.data);

// ── Lịch hẹn / Check-in ───────────────────────────────────

/**
 * Lấy danh sách lịch hẹn 
 * GET /api/admin/lich-hen
 */
export const getTatCaLichHen = () =>
  api.get('/admin/lich-hen/all').then((r) => r.data);

/**
 * Check-in lịch hẹn
 * PATCH /api/admin/lich-hen/:idLichHen/checkin
 */
export const checkInLichHen = (idLichHen) =>
  api.patch(`/admin/lich-hen/${idLichHen}/checkin`).then((r) => r.data);

/**
 * Hủy lịch hẹn
 * PATCH /api/admin/lich-hen/:idLichHen/huy
 */
export const huyLichHen = (idLichHen) =>
  api.patch(`/admin/lich-hen/${idLichHen}/huy`).then((r) => r.data);

/**
 * Dời lịch xuống cuối danh sách
 * PATCH /api/admin/lich-hen/:idLichHen/doi-cuoi
 */
export const doiLichXuongCuoi = (idLichHen) =>
  api.patch(`/admin/lich-hen/${idLichHen}/doi-cuoi`).then((r) => r.data);