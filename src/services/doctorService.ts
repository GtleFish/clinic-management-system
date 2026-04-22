import api from "@/lib/apiClient";

export const getDanhSachChoKham = (idBacSi: string, date?: string) =>
  api.get("/doctor/danh-sach-cho", { params: { idBacSi, date } }).then((r) => r.data);

/** Lấy tất cả lịch hẹn đã đặt với bác sĩ (không chỉ "Đã đến") */
export const getLichHenCuaToi = (idBacSi: string, date?: string) =>
  api.get("/doctor/lich-hen-cua-toi", { params: { idBacSi, date } }).then((r) => r.data);

/** Bác sĩ trưởng: Lấy danh sách kết quả khám chờ duyệt trong khoa */
export const getKetQuaChoDuyet = (idKhoa: string) =>
  api.get("/doctor/ket-qua-cho-duyet", { params: { idKhoa } }).then((r) => r.data);

export const luuKetQuaKham = (data: object) =>
  api.post("/doctor/ket-qua-kham", data).then((r) => r.data);

/** Lấy kết quả khám gần nhất của bệnh nhân */
export const getKetQuaKhamCuaBenhNhan = (idBenhNhan: string) =>
  api.get(`/doctor/ket-qua-kham/${idBenhNhan}`).then((r) => r.data);

export const getBenhNhanDetail = (idBenhNhan: string) =>
  api.get(`/doctor/benh-nhan/${idBenhNhan}`).then((r) => r.data);

export const getKhoaList = () =>
  api.get("/doctor/khoa").then((r) => r.data);

/** Lấy danh sách bác sĩ trưởng khoa (isTruongKhoa = true) */
export const getBacSiTruongList = () =>
  api.get("/doctor/bac-si-truong").then((r) => r.data);
