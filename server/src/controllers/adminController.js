const knex = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const statisticsService = require('../services/statisticsService');
const PaymentRepository = require('../repositories/PaymentRepository');

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
 * Lấy danh sách lịch hẹn hôm nay (kèm tên bệnh nhân, bác sĩ, khoa, thông tin thanh toán)
 * GET /api/admin/lich-hen/hom-nay
 */
const getTatCaLichHen = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lichHenList = await knex('LichHen')
      .leftJoin('BenhNhan', 'LichHen.idBenhNhan', 'BenhNhan.idBenhNhan')
      .leftJoin('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
      .leftJoin('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .leftJoin('ThanhToan', 'LichHen.idLichHen', 'ThanhToan.idLichHen')
      .select(
        'LichHen.idLichHen',
        'LichHen.ngayHen',
        'LichHen.gioHen',
        'LichHen.trangThai',
        'BenhNhan.hoTen as hoTenBenhNhan',
        'BenhNhan.sdt as soDienThoai',
        'BacSi.hoTen as hoTenBacSi',
        'Khoa.tenKhoa',
        'ThanhToan.idThanhToan',
        'ThanhToan.soTienCoc',
        'ThanhToan.trangThai as trangThaiThanhToan'
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
 * Lấy thông tin thanh toán của lịch hẹn
 * GET /api/admin/lich-hen/:idLichHen/thanh-toan
 */
const getPaymentByLichHen = async (req, res) => {
  const { idLichHen } = req.params;
  
  try {
    const payment = await knex('ThanhToan')
      .where({ idLichHen })
      .first();

    if (!payment) {
      return res.status(404).json({ 
        message: 'Chưa có thông tin thanh toán cho lịch hẹn này',
        hasPayment: false,
      });
    }

    return res.status(200).json({ 
      hasPayment: true,
      data: payment,
    });
  } catch (err) {
    console.error('getPaymentByLichHen error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Check-in lịch hẹn
 * PATCH /api/admin/lich-hen/:idLichHen/checkin
 * Body (optional): { soTienCoc: number }
 */
const checkInLichHen = async (req, res) => {
  const { idLichHen } = req.params;
  const { soTienCoc } = req.body || {}; // Số tiền cọc tùy chỉnh (optional)
  
  try {
    // Lấy thông tin lịch hẹn
    const lichHen = await knex('LichHen').where({ idLichHen }).first();
    if (!lichHen) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }
    
    // Kiểm tra trạng thái
    if (lichHen.trangThai === 'huy') {
      return res.status(400).json({ message: 'Lịch hẹn đã bị hủy' });
    }
    if (lichHen.trangThai === 'da_checkin' || lichHen.trangThai === 'cho_kham') {
      return res.status(400).json({ message: 'Lịch hẹn đã được check-in' });
    }

    // Validate số tiền cọc nếu có
    const depositAmount = soTienCoc ? parseFloat(soTienCoc) : 300000; // Mặc định 300k
    if (isNaN(depositAmount) || depositAmount < 0) {
      return res.status(400).json({ message: 'Số tiền cọc không hợp lệ' });
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    let paymentInfo = null;
    
    await knex.transaction(async (trx) => {
      // 1. Cập nhật trạng thái lịch hẹn
      await trx('LichHen').where({ idLichHen }).update({ trangThai: 'cho_kham' });

      // 2. Kiểm tra xem đã có thanh toán chưa
      const existingPayment = await trx('ThanhToan')
        .where({ idLichHen })
        .first();

      if (existingPayment) {
        // Nếu đã có thanh toán, cập nhật trạng thái và số tiền
        await trx('ThanhToan')
          .where({ idThanhToan: existingPayment.idThanhToan })
          .update({ 
            trangThai: 'da_coc',
            soTienCoc: depositAmount,
            ngayThanhToan: knex.fn.now(),
            ghiChu: soTienCoc 
              ? `Tiền cọc ${depositAmount.toLocaleString('vi-VN')}đ khi check-in`
              : 'Tiền cọc tự động khi check-in',
          });
        
        paymentInfo = {
          idThanhToan: existingPayment.idThanhToan,
          soTienCoc: depositAmount,
          isNew: false,
        };
      } else {
        // Nếu chưa có thanh toán, tạo mới
        const newPaymentId = `TT-${uuidv4().slice(0, 8).toUpperCase()}`;

        await trx('ThanhToan').insert({
          idThanhToan: newPaymentId,
          idBenhNhan: lichHen.idBenhNhan,
          idLichHen: lichHen.idLichHen,
          soTienCoc: depositAmount,
          loaiThanhToan: 'khi_den_kham',
          trangThai: 'da_coc',
          ngayTao: knex.fn.now(),
          ngayThanhToan: knex.fn.now(),
          ghiChu: soTienCoc 
            ? `Tiền cọc ${depositAmount.toLocaleString('vi-VN')}đ khi check-in`
            : 'Tiền cọc tự động khi check-in',
        });

        paymentInfo = {
          idThanhToan: newPaymentId,
          soTienCoc: depositAmount,
          isNew: true,
        };
      }
    });

    return res.status(200).json({ 
      message: 'Check-in thành công. Tiền cọc đã được ghi nhận vào doanh thu.',
      payment: paymentInfo,
    });
  } catch (err) {
    console.error('checkInLichHen error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      message: 'Lỗi server, vui lòng thử lại',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

/**
 * Lấy tổng quan thống kê (4 chỉ số cơ bản)
 * GET /api/admin/statistics/overview?fromDate=&toDate=&idKhoa=
 */
const getStatisticsOverview = async (req, res) => {
  try {
    const { startDate, endDate, idKhoa } = req.query;

    const fromDate = startDate || endDate ? startDate : undefined;
    const toDate = startDate || endDate ? endDate : undefined;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: 'startDate và endDate là bắt buộc' });
    }

    const overview = await statisticsService.getOverview(fromDate, toDate, idKhoa);

    // Transform backend response to match frontend expectation
    return res.status(200).json({
      bookingCount: overview.metrics.totalBookings,
      depositRevenue: overview.metrics.totalRevenue,
      examinationCount: overview.metrics.totalExaminations,
      doctorExamCount: overview.metrics.totalExamsByShift,
    });
  } catch (err) {
    console.error('getStatisticsOverview error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Lấy dữ liệu doanh thu hàng ngày (cho line chart)
 * GET /api/admin/statistics/revenue?fromDate=&toDate=&idKhoa=
 */
const getRevenueData = async (req, res) => {
  try {
    const { startDate, endDate, idKhoa } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate và endDate là bắt buộc' });
    }

    const data = await statisticsService.getDailyRevenueData(startDate, endDate, idKhoa);

    return res.status(200).json(data);
  } catch (err) {
    console.error('getRevenueData error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * So sánh thống kê 2 tháng
 * GET /api/admin/statistics/comparison?month1=&month2=&idKhoa=
 */
const getMonthlyComparison = async (req, res) => {
  try {
    const { month1, month2, idKhoa } = req.query;

    if (!month1 || !month2) {
      return res.status(400).json({ message: 'month1 và month2 là bắt buộc (format: YYYY-MM)' });
    }

    const comparison = await statisticsService.getMonthlyComparison(month1, month2, idKhoa);

    return res.status(200).json({ data: comparison });
  } catch (err) {
    console.error('getMonthlyComparison error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Lấy số lần bác sĩ khám theo ca
 * GET /api/admin/statistics/doctor-shift?fromDate=&toDate=&idKhoa=
 */
const getDoctorShiftStats = async (req, res) => {
  try {
    const { fromDate, toDate, idKhoa } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: 'fromDate và toDate là bắt buộc' });
    }

    const data = await statisticsService.getDoctorExamCountByShift(fromDate, toDate, idKhoa);

    return res.status(200).json({ data });
  } catch (err) {
    console.error('getDoctorShiftStats error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Phân bổ bệnh nhân theo khoa
 * GET /api/admin/statistics/departments?fromDate=&toDate=
 */
const getDepartmentStats = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: 'fromDate và toDate là bắt buộc' });
    }

    const data = await statisticsService.getDepartmentBreakdown(fromDate, toDate);

    return res.status(200).json({ data });
  } catch (err) {
    console.error('getDepartmentStats error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Chi tiết hiệu suất bác sĩ
 * GET /api/admin/statistics/doctor-detail?fromDate=&toDate=&idKhoa=
 */
const getDoctorDetailStats = async (req, res) => {
  try {
    const { fromDate, toDate, idKhoa } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: 'fromDate và toDate là bắt buộc' });
    }

    const data = await statisticsService.getDoctorPerformance(fromDate, toDate, idKhoa);

    return res.status(200).json({ data });
  } catch (err) {
    console.error('getDoctorDetailStats error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Tạo bản ghi thanh toán
 * POST /api/admin/payments
 */
const createPayment = async (req, res) => {
  const { idBenhNhan, idLichHen, soTienCoc, loaiThanhToan, ghiChu } = req.body;

  try {
    if (!idBenhNhan || !soTienCoc || !loaiThanhToan) {
      return res.status(400).json({ message: 'idBenhNhan, soTienCoc, loaiThanhToan là bắt buộc' });
    }

    // Kiểm tra bệnh nhân tồn tại
    const patient = await knex('BenhNhan').where({ idBenhNhan }).first();
    if (!patient) {
      return res.status(404).json({ message: 'Bệnh nhân không tồn tại' });
    }

    const payment = await PaymentRepository.create({
      idBenhNhan,
      idLichHen: idLichHen || null,
      soTienCoc: parseFloat(soTienCoc),
      loaiThanhToan,
      trangThai: 'da_coc',
      ghiChu: ghiChu || null,
    });

    return res.status(201).json({
      message: 'Tạo bản ghi thanh toán thành công',
      data: payment,
    });
  } catch (err) {
    console.error('createPayment error:', err);
    return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại' });
  }
};

/**
 * Cập nhật trạng thái thanh toán
 * PATCH /api/admin/payments/:idThanhToan
 */
const updatePaymentStatus = async (req, res) => {
  const { idThanhToan } = req.params;
  const { trangThai } = req.body;

  try {
    if (!trangThai || !['da_coc', 'thanh_toan_du', 'tra_lai'].includes(trangThai)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const payment = await PaymentRepository.findById(idThanhToan);
    if (!payment) {
      return res.status(404).json({ message: 'Bản ghi thanh toán không tồn tại' });
    }

    const updated = await PaymentRepository.updateStatus(idThanhToan, trangThai);

    if (updated) {
      const updatedPayment = await PaymentRepository.findById(idThanhToan);
      return res.status(200).json({
        message: 'Cập nhật trạng thái thành công',
        data: updatedPayment,
      });
    }

    return res.status(500).json({ message: 'Cập nhật thất bại' });
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
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
  getPaymentByLichHen,
  checkInLichHen,
  huyLichHen,
  doiLichXuongCuoi,
  // statistics
  getStatisticsOverview,
  getRevenueData,
  getMonthlyComparison,
  getDoctorShiftStats,
  getDepartmentStats,
  getDoctorDetailStats,
  // payments
  createPayment,
  updatePaymentStatus,
};