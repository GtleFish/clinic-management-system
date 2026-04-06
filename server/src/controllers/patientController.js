const knex = require("../db");

/**
 * US-PAT-03: Lấy lịch sử khám bệnh của bệnh nhân
 * GET /api/patient/lich-su-kham
 */
const getLichSuKham = async (req, res) => {
  try {
    const idBenhNhan = req.user?.idBenhNhan || req.query.idBenhNhan;
    if (!idBenhNhan) {
      return res.status(400).json({ message: "Thiếu idBenhNhan" });
    }

    const list = await knex("LichSuKham")
      .leftJoin("BacSiTruong", "LichSuKham.idBacSiTruong", "BacSiTruong.idBacSiTruong")
      .select(
        "LichSuKham.idLichSu",
        "LichSuKham.ngayKham",
        "LichSuKham.chanDoan",
        "LichSuKham.huongDieuTri",
        "BacSiTruong.hoTen as tenBacSiTruong",
      )
      .where("LichSuKham.idBenhNhan", idBenhNhan)
      .orderBy("LichSuKham.ngayKham", "desc");

    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error("getLichSuKham:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * US-PAT-03: Lấy đơn thuốc theo lượt khám
 * GET /api/patient/don-thuoc/:idLichSu
 */
const getDonThuoc = async (req, res) => {
  try {
    const { idLichSu } = req.params;
    const prescriptions = await knex("DonThuoc")
      .select("idDonThuoc", "tenThuoc", "soLuong", "lieuLuong", "ngayKeDon")
      .where({ idLichSu })
      .orderBy("ngayKeDon", "desc");

    return res.json({ data: prescriptions, total: prescriptions.length });
  } catch (err) {
    console.error("getDonThuoc:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getLichSuKham,
  getDonThuoc,
};
