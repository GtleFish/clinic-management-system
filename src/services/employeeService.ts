import api from '@/lib/apiClient';

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

export const checkIn = (idLichHen: string, ghiChu?: string) =>
  api.put(`/employee/lich-hen/${idLichHen}/checkin`, { ghiChu }).then(r => r.data);

// ── Dropdown ─────────────────────────────────────────────
export const getBacSiList = () =>
  api.get('/employee/bac-si').then(r => r.data);