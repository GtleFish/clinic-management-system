import api from "@/lib/apiClient";

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
