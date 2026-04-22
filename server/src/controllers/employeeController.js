const knex   = require('../db');
const { v4: uuidv4 } = require('uuid');

// ══════════════════════════════════════════════════════════
//  US-EMP-01 — Quản lý thông tin bệnh nhân
// ══════════════════════════════════════════════════════════

/**
 * Lấy danh sách bệnh nhân — tìm theo tên hoặc SĐT (AC3)
 * GET /api/employee/benh-nhan?search=
 */
const getBenhNhan = async (req, res) => {
  try {
    const { search } = req.query;
    const list = await knex('BenhNhan')
      .modify(qb => {
        if (search) {
          qb.where('hoTen', 'like', `%${search}%`)
            .orWhere('sdt',   'like', `%${search}%`)
            .orWhere('cccd',  'like', `%${search}%`);
        }
      })
      .orderBy('hoTen');
    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error('getBenhNhan:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy chi tiết 1 bệnh nhân
 * GET /api/employee/benh-nhan/:id
 */
const getBenhNhanById = async (req, res) => {
  try {
    const bn = await knex('BenhNhan').where({ idBenhNhan: req.params.id }).first();
    if (!bn) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
    return res.json({ data: bn });
  } catch (err) {
    console.error('getBenhNhanById:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Thêm mới bệnh nhân (AC1)
 * POST /api/employee/benh-nhan
 */
const createBenhNhan = async (req, res) => {
  const { hoTen, cccd, gioiTinh, ngaySinh, sdt, gmail, soBaoHiem, benhNen, tuoi } = req.body;
  try {
    // Kiểm tra CCCD trùng
    const existed = await knex('BenhNhan').where({ cccd }).first();
    if (existed) return res.status(409).json({ message: 'CCCD đã tồn tại trong hệ thống' });

    const idBenhNhan = `BN-${uuidv4().slice(0, 8).toUpperCase()}`;
    await knex('BenhNhan').insert({
      idBenhNhan, hoTen, cccd, gioiTinh, ngaySinh,
      sdt, gmail: gmail || null,
      soBaoHiem: soBaoHiem || null,
      benhNen:   benhNen   || null,
      tuoi:      tuoi      || null,
    });
    const created = await knex('BenhNhan').where({ idBenhNhan }).first();
    return res.status(201).json({ message: 'Thêm bệnh nhân thành công', data: created });
  } catch (err) {
    console.error('createBenhNhan:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Cập nhật thông tin bệnh nhân (AC2)
 * PUT /api/employee/benh-nhan/:id
 */
const updateBenhNhan = async (req, res) => {
  const { id } = req.params;
  const { hoTen, gioiTinh, ngaySinh, sdt, gmail, soBaoHiem, benhNen, tuoi } = req.body;
  try {
    const bn = await knex('BenhNhan').where({ idBenhNhan: id }).first();
    if (!bn) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });

    const updateData = {};
    if (hoTen     !== undefined) updateData.hoTen     = hoTen;
    if (gioiTinh  !== undefined) updateData.gioiTinh  = gioiTinh;
    if (ngaySinh  !== undefined) updateData.ngaySinh  = ngaySinh;
    if (sdt       !== undefined) updateData.sdt       = sdt;
    if (gmail     !== undefined) updateData.gmail     = gmail;
    if (soBaoHiem !== undefined) updateData.soBaoHiem = soBaoHiem;
    if (benhNen   !== undefined) updateData.benhNen   = benhNen;
    if (tuoi      !== undefined) updateData.tuoi      = tuoi;

    await knex('BenhNhan').where({ idBenhNhan: id }).update(updateData);
    const updated = await knex('BenhNhan').where({ idBenhNhan: id }).first();
    return res.json({ message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    console.error('updateBenhNhan:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// ══════════════════════════════════════════════════════════
//  US-EMP-02 — Tạo lịch khám tại quầy
// ══════════════════════════════════════════════════════════

/**
 * Lấy danh sách lịch hẹn (AC3)
 * GET /api/employee/lich-hen?date=&idBacSi=
 */
const getLichHen = async (req, res) => {
  try {
    const { date, idBacSi } = req.query;
    const list = await knex('LichHen')
      .join('BenhNhan', 'LichHen.idBenhNhan', 'BenhNhan.idBenhNhan')
      .join('BacSi',    'LichHen.idBacSi',    'BacSi.idBacSi')
      .join('Khoa',     'BacSi.idKhoa',        'Khoa.idKhoa')
      .select(
        'LichHen.*',
        'BenhNhan.hoTen  as tenBenhNhan',
        'BenhNhan.sdt    as sdtBenhNhan',
        'BacSi.hoTen     as tenBacSi',
        'Khoa.tenKhoa',
      )
      .modify(qb => {
        if (date)    qb.where('LichHen.ngayHen', date);
        if (idBacSi) qb.where('LichHen.idBacSi', idBacSi);
      })
      .orderBy(['LichHen.ngayHen', 'LichHen.gioHen']);
    return res.json({ data: list, total: list.length });
  } catch (err) {
    console.error('getLichHen:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Tạo lịch khám tại quầy (AC1 + AC2)
 * POST /api/employee/lich-hen
 */
const createLichHen = async (req, res) => {
  const { idBenhNhan, idBacSi, ngayHen, gioHen, ghiChu } = req.body;
  try {
    // Kiểm tra bệnh nhân tồn tại
    const bn = await knex('BenhNhan').where({ idBenhNhan }).first();
    if (!bn) return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });

    // Kiểm tra bác sĩ tồn tại
    const bs = await knex('BacSi').where({ idBacSi }).first();
    if (!bs) return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });

    // Kiểm tra trùng giờ (AC2)
    const conflict = await knex('LichHen')
      .where({ idBacSi, ngayHen, gioHen })
      .whereNotIn('trangThai', ['Hủy'])
      .first();
    if (conflict) {
      return res.status(409).json({
        message: `Bác sĩ đã có lịch hẹn lúc ${gioHen} ngày ${ngayHen}. Vui lòng chọn giờ khác.`,
        conflict: true,
      });
    }

    const idLichHen = `LH-${uuidv4().slice(0, 8).toUpperCase()}`;
    await knex('LichHen').insert({
      idLichHen,
      idBenhNhan,
      idBacSi,
      ngayHen,
      gioHen,
      trangThai:      'Đã đặt lịch',
      //daThanhToanCoc: false,
      ghiChu:         ghiChu || null,
    });

    // Trả về đầy đủ thông tin
    const created = await knex('LichHen')
      .join('BenhNhan', 'LichHen.idBenhNhan', 'BenhNhan.idBenhNhan')
      .join('BacSi',    'LichHen.idBacSi',    'BacSi.idBacSi')
      .join('Khoa',     'BacSi.idKhoa',        'Khoa.idKhoa')
      .select(
        'LichHen.*',
        'BenhNhan.hoTen as tenBenhNhan',
        'BacSi.hoTen    as tenBacSi',
        'Khoa.tenKhoa',
      )
      .where('LichHen.idLichHen', idLichHen)
      .first();

    return res.status(201).json({ message: 'Tạo lịch khám thành công', data: created });
  } catch (err) {
    console.error('createLichHen:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách bác sĩ cho dropdown
 * GET /api/employee/bac-si
 */
const getBacSi = async (req, res) => {
  try {
    const list = await knex('BacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select('BacSi.idBacSi', 'BacSi.hoTen', 'BacSi.chuyenKhoa', 'Khoa.tenKhoa')
      .orderBy('BacSi.hoTen');
    return res.json({ data: list });
  } catch (err) {
    console.error('getBacSi:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * US-EMP-03: Xác nhận bệnh nhân đến khám
 * PUT /api/employee/lich-hen/:idLichHen/checkin
 */
const checkIn = async (req, res) => {
  const { idLichHen } = req.params;
  const { ghiChu } = req.body || {};

  try {
    const lichHen = await knex("LichHen")
      .where({ idLichHen })
      .first();

    if (!lichHen) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    }

    const validStatuses = ["Đã đặt lịch", "Đã xác nhận"];
    if (!validStatuses.includes(lichHen.trangThai)) {
      return res.status(400).json({
        message: "Lịch hẹn không thể check-in ở trạng thái hiện tại",
      });
    }

    const appointmentTime = new Date(`${lichHen.ngayHen}T${lichHen.gioHen}`);
    const lateThreshold = new Date(appointmentTime.getTime() + 30 * 60 * 1000);
    const isDenTre = new Date() > lateThreshold;

    await knex("LichHen")
      .where({ idLichHen })
      .update({
        trangThai: "Đã đến",
        ghiChu: ghiChu !== undefined ? ghiChu : lichHen.ghiChu,
      });

    const updated = await knex("LichHen")
      .join("BenhNhan", "LichHen.idBenhNhan", "BenhNhan.idBenhNhan")
      .join("BacSi", "LichHen.idBacSi", "BacSi.idBacSi")
      .select(
        "LichHen.*",
        "BenhNhan.hoTen as tenBenhNhan",
        "BacSi.hoTen as tenBacSi",
      )
      .where("LichHen.idLichHen", idLichHen)
      .first();

    return res.json({
      message: "Check-in thành công",
      data: updated,
      isDenTre,
    });
  } catch (err) {
    console.error("checkIn:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getBenhNhan, getBenhNhanById, createBenhNhan, updateBenhNhan,
  getLichHen, createLichHen, getBacSi, checkIn,
};