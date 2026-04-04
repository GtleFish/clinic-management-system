const knex = require('../db'); // Sửa lại đường dẫn db nếu cần
const { v4: uuidv4 } = require('uuid');

// 1. Khách hàng đặt lịch khám
const datLichKham = async (req, res) => {
  try {
    const { email, idBacSi, ngayHen, gioHen, ghiChu } = req.body;

    // Tìm mã bệnh nhân (idBenhNhan) dựa vào email
    const patient = await knex('BenhNhan').where({ gmail: email }).first();
    if (!patient) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ bệnh nhân." });
    }

    // Kiểm tra xem ca này đã kín 10 chỗ chưa
    const countQuery = await knex('LichHen')
      .where({ ngayHen, gioHen })
      .whereNotIn('trangThai', ['huy', 'Đã hủy'])
      .count('* as total');
    
    if (countQuery[0].total >= 10) {
      return res.status(400).json({ message: "Ca khám này đã kín chỗ." });
    }

    const idLichHen = `LH-${uuidv4().slice(0, 8).toUpperCase()}`;
    await knex('LichHen').insert({
      idLichHen,
      idBenhNhan: patient.idBenhNhan,
      idBacSi,
      ngayHen,
      gioHen, // Định dạng: '07:00:00'
      trangThai: 'da_dat',
      ghiChu: ghiChu || 'Đặt lịch qua Web'
    });

    return res.status(201).json({ message: 'Đặt lịch thành công!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Lấy Lịch sử khám của Bệnh nhân
const getLichSuKham = async (req, res) => {
  try {
    const { email } = req.query;
    const patient = await knex('BenhNhan').where({ gmail: email }).first();
    if (!patient) return res.json({ data: [] });

    const history = await knex('LichHen')
      .join('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .select(
        'LichHen.*',
        'BacSi.hoTen as doctorName',
        'Khoa.tenKhoa as departmentName'
      )
      .where('LichHen.idBenhNhan', patient.idBenhNhan)
      .orderBy('LichHen.ngayHen', 'desc')
      .orderBy('LichHen.gioHen', 'desc');

    return res.json({ data: history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Lấy số lượng đã đặt trong ngày để khóa nút nếu đầy
const getSoLuongDatTrongNgay = async (req, res) => {
  try {
    const { date } = req.query;
    const counts = await knex('LichHen')
      .select('gioHen')
      .count('* as total')
      .where({ ngayHen: date })
      .whereNotIn('trangThai', ['huy', 'Đã hủy'])
      .groupBy('gioHen');

    return res.json({ data: counts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { datLichKham, getLichSuKham, getSoLuongDatTrongNgay };