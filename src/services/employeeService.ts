import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── US-EMP-01: Bệnh nhân ──────────────────────────────────
export const getBenhNhan    = (search = '') =>
  api.get('/employee/benh-nhan', { params: { search } }).then(r => r.data);

export const getBenhNhanById = (id: string) =>
  api.get(`/employee/benh-nhan/${id}`).then(r => r.data);

export const createBenhNhan = (data: object) =>
  api.post('/employee/benh-nhan', data).then(r => r.data);

export const updateBenhNhan = (id: string, data: object) =>
  api.put(`/employee/benh-nhan/${id}`, data).then(r => r.data);

// ── US-EMP-02: Lịch hẹn ──────────────────────────────────
export const getLichHen = (params: { date?: string; idBacSi?: string } = {}) =>
  api.get('/employee/lich-hen', { params }).then(r => r.data);

export const createLichHen = (data: object) =>
  api.post('/employee/lich-hen', data).then(r => r.data);

// ── Dropdown ─────────────────────────────────────────────
export const getBacSiList = () =>
  api.get('/employee/bac-si').then(r => r.data);