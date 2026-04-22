import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getLichSuKham = (idBenhNhan: string) =>
  api.get("/patient/lich-su-kham", { params: { idBenhNhan } }).then((r) => r.data);

export const getDonThuoc = (idLichSu: string) =>
  api.get(`/patient/don-thuoc/${idLichSu}`).then((r) => r.data);

export const createBooking = (data: any) =>
  api.post("/patient/booking", data).then((r) => r.data);

export const getPatientHistory = (email: string) =>
  api.get(`/patient/history?email=${email}`).then((r) => r.data);

export const getBookingCounts = (date: string) =>
  api.get(`/patient/booking/counts?date=${date}`).then((r) => r.data);

export const getDanhSachKhoa = () =>
  api.get('/patient/khoa').then((r) => r.data);

export const getDanhSachBacSi = () =>
  api.get('/patient/bacsi').then((r) => r.data);
