const knex = require("../db");
const { v4: uuidv4 } = require("uuid");

// ── Public: Danh sách khoa (cho trang đặt lịch) ────────────
const getDanhSachKhoa = async (req, res) => {
  try {
    const khoa = await knex('Khoa')
      .select('Khoa.idKhoa', 'Khoa.tenKhoa', 'Khoa.moTa')
      .orderBy('Khoa.tenKhoa');

    // Đếm số bác sĩ mỗi khoa
    const counts = await knex('BacSi')
      .select('idKhoa')
      .count('* as total')
      .groupBy('idKhoa');

    const countMap = {};
    counts.forEach((c) => { countMap[c.idKhoa] = c.total; });

    const data = khoa.map((k) => ({
      id: k.idKhoa,
      name: k.tenKhoa,
      description: k.moTa || '',
      doctorCount: countMap[k.idKhoa] || 0,
    }));

    return res.json({ data });
  } catch (err) {
    console.error('getDanhSachKhoa error:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// ── Public: Danh sách bác sĩ (cho trang đặt lịch) ──────────
const getDanhSachBacSi = async (req, res) => {
  try {
    const { idKhoa } = req.query;

    let query = knex('BacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select(
        'BacSi.idBacSi',
        'BacSi.hoTen',
        'BacSi.chuyenKhoa',
        'BacSi.namKinhNghiem',
        'BacSi.idKhoa',
        'Khoa.tenKhoa',
      )
      .orderBy('BacSi.hoTen');

    if (idKhoa) {
      query = query.where('BacSi.idKhoa', idKhoa);
    }

    const doctors = await query;

    const data = doctors.map((d) => ({
      id: d.idBacSi,
      name: `BS. ${d.hoTen}`,
      departmentId: d.idKhoa,
      departmentName: d.tenKhoa,
      title: 'BS',
      specialization: d.chuyenKhoa,
      experience: d.namKinhNghiem,
      avatar: '',
      rating: 4.5,
      reviewCount: 0,
      available: true,
      consultationFee: 300000,
    }));

    return res.json({ data });
  } catch (err) {
    console.error('getDanhSachBacSi error:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// 1. Khách hàng đặt lịch khám
const datLichKham = async (req, res) => {
  try {
    const { email, idBacSi, ngayHen, gioHen, ghiChu } = req.body;

    // Tìm mã bệnh nhân (idBenhNhan) dựa vào email
    const patient = await knex("BenhNhan").where({ gmail: email }).first();
    if (!patient) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ bệnh nhân." });
    }

    // Kiểm tra xem ca này đã kín 10 chỗ chưa
    const countQuery = await knex("LichHen")
      .where({ ngayHen, gioHen })
      .whereNotIn("trangThai", ["huy", "Đã hủy"])
      .count("* as total");
    
    if (countQuery[0].total >= 10) {
      return res.status(400).json({ message: "Ca khám này đã kín chỗ." });
    }

    const idLichHen = `LH-${uuidv4().slice(0, 8).toUpperCase()}`;
    await knex("LichHen").insert({
      idLichHen,
      idBenhNhan: patient.idBenhNhan,
      idBacSi,
      ngayHen,
      gioHen, // Định dạng: '07:00:00'
      trangThai: "da_dat",
      ghiChu: ghiChu || "Đặt lịch qua Web"
    });

    return res.status(201).json({ message: "Đặt lịch thành công!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 2. Lấy lịch sử lịch hẹn theo email
const getPatientHistory = async (req, res) => {
  try {
    const { email } = req.query;
    const patient = await knex("BenhNhan").where({ gmail: email }).first();
    if (!patient) return res.json({ data: [] });

    const history = await knex("LichHen")
      .join("BacSi", "LichHen.idBacSi", "BacSi.idBacSi")
      .join("Khoa", "BacSi.idKhoa", "Khoa.idKhoa")
      .select(
        "LichHen.*",
        "BacSi.hoTen as doctorName",
        "Khoa.tenKhoa as departmentName"
      )
      .where("LichHen.idBenhNhan", patient.idBenhNhan)
      .orderBy("LichHen.ngayHen", "desc")
      .orderBy("LichHen.gioHen", "desc");

    return res.json({ data: history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 3. Lấy số lượng đã đặt trong ngày để khóa nút nếu đầy
const getSoLuongDatTrongNgay = async (req, res) => {
  try {
    const { date } = req.query;
    const counts = await knex("LichHen")
      .select("gioHen")
      .count("* as total")
      .where({ ngayHen: date })
      .whereNotIn("trangThai", ["huy", "Đã hủy"])
      .groupBy("gioHen");

    return res.json({ data: counts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. US-PAT-03: Lấy lịch sử khám bệnh của bệnh nhân
const getLichSuKham = async (req, res) => {
  try {
    // idBenhNhan từ query, hoặc derive từ idUser trong token (US-BN-001 → BN-001)
    const idBenhNhan =
      req.query.idBenhNhan ||
      (req.user?.idBenhNhan) ||
      (req.user?.idUser ? req.user.idUser.replace("US-", "") : null);
    if (!idBenhNhan) {
      return res.status(400).json({ message: "Thiếu idBenhNhan" });
    }

    const list = await knex("LichSuKham")
      .leftJoin("BacSi", "LichSuKham.idBacSi", "BacSi.idBacSi")
      .select(
        "LichSuKham.idLichSu",
        "LichSuKham.ngayKham",
        "LichSuKham.chanDoan",
        "LichSuKham.huongDieuTri",
        "BacSi.hoTen as tenBacSi",
        "BacSi.isTruongKhoa",
      )
      .where("LichSuKham.idBenhNhan", idBenhNhan)
      .orderBy("LichSuKham.ngayKham", "desc");

    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error("getLichSuKham:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 5. US-PAT-03: Lấy đơn thuốc theo lượt khám
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
  datLichKham,
  getPatientHistory,
  getSoLuongDatTrongNgay,
  getLichSuKham,
  getDonThuoc,
  getDanhSachKhoa,
  getDanhSachBacSi,
};
