const knex = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * [AC1] Tạo tài khoản bác sĩ mới
 * POST /api/admin/doctors
 */
const createDoctor = async (req, res) => {
  const { hoTen, idKhoa, chuyenKhoa, namKinhNghiem, username, email } = req.body;

  try {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await knex('users').where({ username }).first();
    if (existingUser) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra khoa có tồn tại không
    const khoa = await knex('Khoa').where({ idKhoa }).first();
    if (!khoa) {
      return res.status(404).json({ message: 'Khoa không tồn tại' });
    }

    // Sinh mật khẩu mặc định: Bs@{username}123
    const defaultPassword = `Bs@${username}123`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const idUser  = `USR-BS-${uuidv4().slice(0, 8).toUpperCase()}`;
    const idBacSi = `BS-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Transaction: tạo user + bacsi cùng lúc
    await knex.transaction(async (trx) => {
      await trx('users').insert({
        idUser,
        role:     'bacsi',
        username: username.trim(),
        password: hashedPassword,
      });

      await trx('BacSi').insert({
        idBacSi,
        idKhoa:          idKhoa.trim(),
        hoTen:           hoTen.trim(),
        chuyenKhoa:      chuyenKhoa.trim(),
        namKinhNghiem:   Number(namKinhNghiem),
      });
    });

    return res.status(201).json({
      message:         'Tạo tài khoản bác sĩ thành công',
      defaultPassword, // Trả về để admin thông báo cho bác sĩ
      data: {
        idBacSi,
        idUser,
        hoTen,
        idKhoa,
        tenKhoa: khoa.tenKhoa,
        chuyenKhoa,
        namKinhNghiem: Number(namKinhNghiem),
        username,
      },
    });
  } catch (err) {
    console.error('createDoctor error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Lấy danh sách tất cả bác sĩ (kèm tên khoa)
 * GET /api/admin/doctors
 */
const getDoctors = async (req, res) => {
  try {
    const { search, idKhoa } = req.query;

    let query = knex('BacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .join('users', function() {
        // join qua username pattern — hoặc có thể lưu idUser trong BacSi
        // Hiện tại join bằng subquery tìm user có role bacsi khớp tên
      })
      .select(
        'BacSi.idBacSi',
        'BacSi.hoTen',
        'BacSi.chuyenKhoa',
        'BacSi.namKinhNghiem',
        'BacSi.idKhoa',
        'Khoa.tenKhoa',
      );

    if (idKhoa) {
      query = query.where('BacSi.idKhoa', idKhoa);
    }
    if (search) {
      query = query.where('BacSi.hoTen', 'like', `%${search}%`);
    }

    const doctors = await knex('BacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select(
        'BacSi.idBacSi',
        'BacSi.hoTen',
        'BacSi.chuyenKhoa',
        'BacSi.namKinhNghiem',
        'BacSi.idKhoa',
        'Khoa.tenKhoa',
      )
      .modify((qb) => {
        if (idKhoa) qb.where('BacSi.idKhoa', idKhoa);
        if (search) qb.where('BacSi.hoTen', 'like', `%${search}%`);
      })
      .orderBy('BacSi.hoTen');

    return res.status(200).json({ data: doctors, total: doctors.length });
  } catch (err) {
    console.error('getDoctors error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Lấy chi tiết 1 bác sĩ
 * GET /api/admin/doctors/:idBacSi
 */
const getDoctorById = async (req, res) => {
  const { idBacSi } = req.params;
  try {
    const doctor = await knex('BacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select(
        'BacSi.idBacSi',
        'BacSi.hoTen',
        'BacSi.chuyenKhoa',
        'BacSi.namKinhNghiem',
        'BacSi.idKhoa',
        'Khoa.tenKhoa',
      )
      .where('BacSi.idBacSi', idBacSi)
      .first();

    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    return res.status(200).json({ data: doctor });
  } catch (err) {
    console.error('getDoctorById error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Cập nhật thông tin bác sĩ
 * PUT /api/admin/doctors/:idBacSi
 */
const updateDoctor = async (req, res) => {
  const { idBacSi } = req.params;
  const { hoTen, idKhoa, chuyenKhoa, namKinhNghiem } = req.body;

  try {
    const doctor = await knex('BacSi').where({ idBacSi }).first();
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    if (idKhoa) {
      const khoa = await knex('Khoa').where({ idKhoa }).first();
      if (!khoa) {
        return res.status(404).json({ message: 'Khoa không tồn tại' });
      }
    }

    const updateData = {};
    if (hoTen)           updateData.hoTen           = hoTen.trim();
    if (idKhoa)          updateData.idKhoa          = idKhoa.trim();
    if (chuyenKhoa)      updateData.chuyenKhoa      = chuyenKhoa.trim();
    if (namKinhNghiem !== undefined) updateData.namKinhNghiem = Number(namKinhNghiem);

    await knex('BacSi').where({ idBacSi }).update(updateData);

    const updated = await knex('BacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select('BacSi.*', 'Khoa.tenKhoa')
      .where('BacSi.idBacSi', idBacSi)
      .first();

    return res.status(200).json({ message: 'Cập nhật thành công', data: updated });
  } catch (err) {
    console.error('updateDoctor error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Xóa / vô hiệu hóa tài khoản bác sĩ
 * DELETE /api/admin/doctors/:idBacSi
 */
const deleteDoctor = async (req, res) => {
  const { idBacSi } = req.params;
  try {
    const doctor = await knex('BacSi').where({ idBacSi }).first();
    if (!doctor) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    await knex('BacSi').where({ idBacSi }).del();

    return res.status(200).json({ message: 'Xóa tài khoản bác sĩ thành công' });
  } catch (err) {
    console.error('deleteDoctor error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Lấy danh sách khoa (dùng cho dropdown)
 * GET /api/admin/khoa
 */
const getKhoa = async (req, res) => {
  try {
    const khoa = await knex('Khoa').select('idKhoa', 'tenKhoa').orderBy('tenKhoa');
    return res.status(200).json({ data: khoa });
  } catch (err) {
    console.error('getKhoa error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};
/**
 * Lấy danh sách lịch hẹn hôm nay (kèm tên bệnh nhân, bác sĩ, khoa)
 * GET /api/admin/lich-hen/hom-nay
 */
const getTatCaLichHen = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lichHenList = await knex('LichHen')
      .join('BenhNhan', 'LichHen.idBenhNhan', 'BenhNhan.idBenhNhan')
      .join('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select(
        'LichHen.idLichHen',
        'LichHen.ngayHen',
        'LichHen.gioHen',
        'LichHen.trangThai',
        'BenhNhan.hoTen as hoTenBenhNhan',
        'BenhNhan.sdt as soDienThoai',
        'BacSi.hoTen as hoTenBacSi',
        'Khoa.tenKhoa'
      )
      .orderBy('LichHen.ngayHen', 'desc') 
      .orderBy('LichHen.gioHen', 'asc');

    return res.status(200).json({ data: lichHenList });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
/**
 * Check-in lịch hẹn
 * PATCH /api/admin/lich-hen/:idLichHen/checkin
 */
const checkInLichHen = async (req, res) => {
  const { idLichHen } = req.params;
  try {
    const lichHen = await knex('LichHen').where({ idLichHen }).first();
    if (!lichHen) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    if (lichHen.trangThai === 'huy') {
      return res.status(400).json({ message: 'Lịch hẹn đã bị hủy' });
    }
    if (lichHen.trangThai === 'da_checkin') {
      return res.status(400).json({ message: 'Lịch hẹn đã được check-in' });
    }
 
    await knex('LichHen').where({ idLichHen }).update({ trangThai: 'cho_kham' });
 
    return res.status(200).json({ message: 'Check-in thành công (Đang chờ khám)' });
  } catch (err) {
    console.error('checkInLichHen error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};
 
/**
 * Hủy lịch hẹn
 * PATCH /api/admin/lich-hen/:idLichHen/huy
 */
const huyLichHen = async (req, res) => {
  const { idLichHen } = req.params;
  try {
    const lichHen = await knex('LichHen').where({ idLichHen }).first();
    if (!lichHen) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    if (lichHen.trangThai === 'huy') {
      return res.status(400).json({ message: 'Lịch hẹn đã bị hủy trước đó' });
    }
 
    await knex('LichHen').where({ idLichHen }).update({ trangThai: 'huy' });
 
    return res.status(200).json({ message: 'Hủy lịch hẹn thành công' });
  } catch (err) {
    console.error('huyLichHen error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};
 
/**
 * Dời lịch hẹn xuống cuối danh sách (đổi gioHen → 17:00)
 * PATCH /api/admin/lich-hen/:idLichHen/doi-cuoi
 */
const doiLichXuongCuoi = async (req, res) => {
  const { idLichHen } = req.params;
  try {
    const lichHen = await knex('LichHen').where({ idLichHen }).first();
    if (!lichHen) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    if (lichHen.trangThai !== 'cho_kham') {
      return res.status(400).json({ message: 'Chỉ có thể dời lịch đang chờ khám' });
    }
 
    await knex('LichHen').where({ idLichHen }).update({ gioHen: '17:00:00' });
 
    return res.status(200).json({ message: 'Đã dời lịch xuống cuối danh sách' });
  } catch (err) {
    console.error('doiLichXuongCuoi error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getKhoa,
  // check-in
  getTatCaLichHen,
  checkInLichHen,
  huyLichHen,
  doiLichXuongCuoi,
};