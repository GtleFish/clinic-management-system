import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDanhSachChoKham = (idBacSi: string, date?: string) =>
  api.get("/doctor/danh-sach-cho", { params: { idBacSi, date } }).then((r) => r.data);

export const luuKetQuaKham = (data: object) =>
  api.post("/doctor/ket-qua-kham", data).then((r) => r.data);

export const getBenhNhanDetail = (idBenhNhan: string) =>
  api.get(`/doctor/benh-nhan/${idBenhNhan}`).then((r) => r.data);

export const getKhoaList = () =>
  api.get("/doctor/khoa").then((r) => r.data);

export const getBacSiTruongList = () =>
  api.get("/doctor/bac-si-truong").then((r) => r.data);
