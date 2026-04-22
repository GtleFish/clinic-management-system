const knex = require("../db");
const { v4: uuidv4 } = require("uuid");

/**
 * US-DOC-02: Danh sách bệnh nhân chờ khám
 * GET /api/doctor/danh-sach-cho
 */
const getDanhSachChoKham = async (req, res) => {
  try {
    const { idBacSi, date } = req.query;
    if (!idBacSi) {
      return res.status(400).json({ message: "Thiếu idBacSi" });
    }

    const ngayHen = date || new Date().toISOString().slice(0, 10);

    const list = await knex("LichHen")
      .join("BenhNhan", "LichHen.idBenhNhan", "BenhNhan.idBenhNhan")
      .leftJoin("BacSi", "LichHen.idBacSi", "BacSi.idBacSi")
      .leftJoin("Khoa", "BacSi.idKhoa", "Khoa.idKhoa")
      .select(
        "LichHen.idLichHen",
        "LichHen.idBenhNhan",
        "LichHen.gioHen",
        "LichHen.trangThai",
        "BenhNhan.hoTen as tenBenhNhan",
        "BenhNhan.tuoi",
        "BenhNhan.sdt",
        "BenhNhan.benhNen",
        "Khoa.tenKhoa",
      )
      .where("LichHen.idBacSi", idBacSi)
      .where("LichHen.trangThai", "Đã đến")
      .where("LichHen.ngayHen", ngayHen)
      .orderBy("LichHen.gioHen", "asc");

    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error("getDanhSachChoKham:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * US-DOC-02: Lưu kết quả khám và cập nhật trạng thái lịch hẹn
 * POST /api/doctor/ket-qua-kham
 */
const luuKetQuaKham = async (req, res) => {
  const {
    idLichHen,
    trieuChung,
    chanDoan,
    huongDieuTri,
    idBacSi, // Bác sĩ ký duyệt (có thể là trưởng khoa hoặc bác sĩ khám)
    khoaTiepTheo,
  } = req.body || {};

  if (!idLichHen || !chanDoan || !idBacSi) {
    return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
  }

  try {
    const result = await knex.transaction(async (trx) => {
      const lichHen = await trx("LichHen")
        .where({ idLichHen })
        .first();

      if (!lichHen) {
        throw new Error("NOT_FOUND");
      }

      if (lichHen.trangThai !== "Đã đến") {
        throw new Error("INVALID_STATUS");
      }

      const idLichSu = `LS-${uuidv4().slice(0, 8).toUpperCase()}`;
      const ngayKham = new Date().toISOString().slice(0, 10);

      await trx("LichSuKham").insert({
        idLichSu,
        ngayKham,
        chanDoan,
        huongDieuTri: huongDieuTri || null,
        idBenhNhan: lichHen.idBenhNhan,
        idBacSi,
      });

      const nextStatus = khoaTiepTheo ? "Chờ khám" : "Hoàn thành";
      await trx("LichHen")
        .where({ idLichHen })
        .update({ trangThai: nextStatus });

      return { idLichSu, trangThai: nextStatus };
    });

    return res.status(201).json({
      message: "Đã lưu kết quả khám",
      data: result,
    });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }
    if (err.message === "INVALID_STATUS") {
      return res.status(400).json({ message: "Lịch hẹn không ở trạng thái Đã đến" });
    }
    console.error("luuKetQuaKham:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * US-DOC-02: Lấy thông tin bệnh nhân và lịch sử gần nhất
 * GET /api/doctor/benh-nhan/:idBenhNhan
 */
const getBenhNhanDetail = async (req, res) => {
  try {
    const { idBenhNhan } = req.params;
    const benhNhan = await knex("BenhNhan")
      .where({ idBenhNhan })
      .first();

    if (!benhNhan) {
      return res.status(404).json({ message: "Không tìm thấy bệnh nhân" });
    }

    const lichSuGanNhat = await knex("LichSuKham")
      .where({ idBenhNhan })
      .orderBy("ngayKham", "desc")
      .first();

    return res.json({
      data: {
        ...benhNhan,
        lichSuGanNhat: lichSuGanNhat || null,
      },
    });
  } catch (err) {
    console.error("getBenhNhanDetail:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getKhoaList = async (req, res) => {
  try {
    const khoa = await knex("Khoa")
      .select("idKhoa", "tenKhoa")
      .orderBy("tenKhoa");
    return res.json({ data: khoa });
  } catch (err) {
    console.error("getKhoaList:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getBacSiTruongList = async (req, res) => {
  try {
    // Lấy danh sách bác sĩ là trưởng khoa
    const list = await knex("BacSi")
      .select("idBacSi", "hoTen", "chuyenKhoa", "phuCap")
      .where("isTruongKhoa", true)
      .orderBy("hoTen");
    return res.json({ data: list });
  } catch (err) {
    console.error("getBacSiTruongList:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy danh sách lịch hẹn đã đặt với bác sĩ (tất cả trạng thái)
 * GET /api/doctor/lich-hen-cua-toi
 */
const getLichHenCuaToi = async (req, res) => {
  try {
    const { idBacSi, date } = req.query;
    if (!idBacSi) {
      return res.status(400).json({ message: "Thiếu idBacSi" });
    }

    const ngayHen = date || new Date().toISOString().slice(0, 10);

    const list = await knex("LichHen")
      .join("BenhNhan", "LichHen.idBenhNhan", "BenhNhan.idBenhNhan")
      .leftJoin("BacSi", "LichHen.idBacSi", "BacSi.idBacSi")
      .leftJoin("Khoa", "BacSi.idKhoa", "Khoa.idKhoa")
      .select(
        "LichHen.idLichHen",
        "LichHen.idBenhNhan",
        "LichHen.ngayHen",
        "LichHen.gioHen",
        "LichHen.trangThai",
        "LichHen.ghiChu",
        "BenhNhan.hoTen as tenBenhNhan",
        "BenhNhan.tuoi",
        "BenhNhan.sdt",
        "BenhNhan.benhNen",
        "Khoa.tenKhoa",
      )
      .where("LichHen.idBacSi", idBacSi)
      .where("LichHen.ngayHen", ngayHen)
      .whereNotIn("LichHen.trangThai", ["huy", "Đã hủy"])
      .orderBy("LichHen.gioHen", "asc");

    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error("getLichHenCuaToi:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Bác sĩ trưởng: Lấy danh sách kết quả khám chờ duyệt trong khoa
 * GET /api/doctor/ket-qua-cho-duyet
 */
const getKetQuaChoDuyet = async (req, res) => {
  try {
    const { idKhoa } = req.query;
    if (!idKhoa) {
      return res.status(400).json({ message: "Thiếu idKhoa" });
    }

    // Lấy lịch sử khám chưa có bác sĩ ký duyệt (idBacSi NULL hoặc chưa phải trưởng khoa)
    // Hoặc có thể thêm cột trangThaiDuyet vào LichSuKham
    // Tạm thời: lấy tất cả lịch sử khám trong khoa trong 7 ngày gần nhất
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    const fromDateStr = fromDate.toISOString().slice(0, 10);

    const list = await knex("LichSuKham")
      .join("BenhNhan", "LichSuKham.idBenhNhan", "BenhNhan.idBenhNhan")
      .join("BacSi as BacSiKy", "LichSuKham.idBacSi", "BacSiKy.idBacSi")
      .join("LichHen", "LichSuKham.idBenhNhan", "LichHen.idBenhNhan")
      .join("BacSi as BacSiKham", "LichHen.idBacSi", "BacSiKham.idBacSi")
      .select(
        "LichSuKham.idLichSu",
        "LichSuKham.ngayKham",
        "LichSuKham.chanDoan",
        "LichSuKham.huongDieuTri",
        "BenhNhan.hoTen as tenBenhNhan",
        "BenhNhan.tuoi",
        "BacSiKham.hoTen as tenBacSiKham",
        "BacSiKy.hoTen as tenBacSiKy",
        "BacSiKy.isTruongKhoa"
      )
      .where("BacSiKham.idKhoa", idKhoa)
      .where("LichSuKham.ngayKham", ">=", fromDateStr)
      .orderBy("LichSuKham.ngayKham", "desc");

    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error("getKetQuaChoDuyet:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Lấy kết quả khám theo idBenhNhan (lần gần nhất liên quan đến lịch hẹn)
 * GET /api/doctor/ket-qua-kham/:idBenhNhan
 */
const getKetQuaKhamCuaBenhNhan = async (req, res) => {
  try {
    const { idBenhNhan } = req.params;
    const result = await knex("LichSuKham")
      .leftJoin("BacSi", "LichSuKham.idBacSi", "BacSi.idBacSi")
      .select(
        "LichSuKham.idLichSu",
        "LichSuKham.ngayKham",
        "LichSuKham.chanDoan",
        "LichSuKham.huongDieuTri",
        "BacSi.hoTen as tenBacSi",
      )
      .where("LichSuKham.idBenhNhan", idBenhNhan)
      .orderBy("LichSuKham.ngayKham", "desc")
      .first();

    return res.json({ data: result || null });
  } catch (err) {
    console.error("getKetQuaKhamCuaBenhNhan:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getDanhSachChoKham,
  luuKetQuaKham,
  getBenhNhanDetail,
  getKhoaList,
  getBacSiTruongList,
  getLichHenCuaToi,
  getKetQuaChoDuyet,
  getKetQuaKhamCuaBenhNhan,
};
