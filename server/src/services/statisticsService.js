const knex = require('../db');

/**
 * Thống kê số bệnh nhân đặt khám (unique patients who booked appointments)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getBookingStatistics = async (fromDate, toDate, idKhoa = null) => {
  try {
    let query = knex('LichHen')
      .countDistinct('LichHen.idBenhNhan as count')
      .where('LichHen.ngayHen', '>=', fromDate)
      .where('LichHen.ngayHen', '<=', toDate)
      .where('LichHen.trangThai', '!=', 'huy');

    if (idKhoa) {
      query = query
        .join('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
        .where('BacSi.idKhoa', idKhoa);
    }

    const result = await query.first();
    return result?.count || 0;
  } catch (err) {
    console.error('getBookingStatistics error:', err);
    throw err;
  }
};

/**
 * Doanh thu từ tiền cọc (deposit revenue)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getDepositRevenue = async (fromDate, toDate, idKhoa = null) => {
  try {
    let query = knex('ThanhToan')
      .sum('soTienCoc as totalRevenue')
      .count('* as totalPayments')
      .where('ThanhToan.ngayTao', '>=', `${fromDate} 00:00:00`)
      .where('ThanhToan.ngayTao', '<=', `${toDate} 23:59:59`)
      .where('ThanhToan.trangThai', '!=', 'tra_lai');

    if (idKhoa) {
      // Join with LichHen to filter by department
      query = query
        .leftJoin('LichHen', 'ThanhToan.idLichHen', 'LichHen.idLichHen')
        .leftJoin('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
        .where(builder => {
          builder
            .where('BacSi.idKhoa', idKhoa)
            .orWhereNull('LichHen.idLichHen'); // Include standalone payments
        });
    }

    const result = await query.first();
    return {
      totalRevenue: result?.totalRevenue ? parseFloat(result.totalRevenue) : 0,
      totalPayments: result?.totalPayments || 0,
    };
  } catch (err) {
    console.error('getDepositRevenue error:', err);
    throw err;
  }
};

/**
 * Số bệnh nhân khám (count of patients who completed examinations)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getExaminationStatistics = async (fromDate, toDate, idKhoa = null) => {
  try {
    let query = knex('LichSuKham')
      .countDistinct('LichSuKham.idBenhNhan as count')
      .where('LichSuKham.ngayKham', '>=', fromDate)
      .where('LichSuKham.ngayKham', '<=', toDate);

    if (idKhoa) {
      query = query
        .join('BacSi', 'LichSuKham.idBacSi', 'BacSi.idBacSi')
        .where('BacSi.idKhoa', idKhoa);
    }

    const result = await query.first();
    return result?.count || 0;
  } catch (err) {
    console.error('getExaminationStatistics error:', err);
    throw err;
  }
};

/**
 * Số lần bác sĩ khám theo ca (examination count by time shift)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getDoctorExamCountByShift = async (fromDate, toDate, idKhoa = null) => {
  try {
    let query = knex('LichHen')
      .select(
        'LichHen.gioHen',
        'BacSi.idBacSi',
        'BacSi.hoTen',
        'Khoa.idKhoa',
        'Khoa.tenKhoa'
      )
      .count('LichHen.idLichHen as examCount')
      .join('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .where('LichHen.ngayHen', '>=', fromDate)
      .where('LichHen.ngayHen', '<=', toDate)
      .whereIn('LichHen.trangThai', ['Đã đến', 'Hoàn thành', 'da_checkin', 'cho_kham'])
      .groupBy('LichHen.gioHen', 'BacSi.idBacSi', 'BacSi.hoTen', 'Khoa.idKhoa', 'Khoa.tenKhoa')
      .orderBy('LichHen.gioHen');

    if (idKhoa) {
      query = query.where('Khoa.idKhoa', idKhoa);
    }

    const result = await query;
    return result || [];
  } catch (err) {
    console.error('getDoctorExamCountByShift error:', err);
    throw err;
  }
};

/**
 * So sánh thống kê 2 tháng (current month vs previous month)
 * @param {string} currentMonth - YYYY-MM format
 * @param {string} previousMonth - YYYY-MM format
 * @param {string} idKhoa - optional department filter
 */
const getMonthlyComparison = async (currentMonth, previousMonth, idKhoa = null) => {
  try {
    const [currentFromDate, currentToDate] = getMonthDateRange(currentMonth);
    const [prevFromDate, prevToDate] = getMonthDateRange(previousMonth);

    // Get metrics for current month
    const currentBookings = await getBookingStatistics(currentFromDate, currentToDate, idKhoa);
    const currentRevenue = await getDepositRevenue(currentFromDate, currentToDate, idKhoa);
    const currentExams = await getExaminationStatistics(currentFromDate, currentToDate, idKhoa);

    // Get metrics for previous month
    const prevBookings = await getBookingStatistics(prevFromDate, prevToDate, idKhoa);
    const prevRevenue = await getDepositRevenue(prevFromDate, prevToDate, idKhoa);
    const prevExams = await getExaminationStatistics(prevFromDate, prevToDate, idKhoa);

    return {
      currentMonth,
      previousMonth,
      bookings: {
        current: currentBookings,
        previous: prevBookings,
        percentChange: calculatePercentChange(prevBookings, currentBookings),
      },
      revenue: {
        current: currentRevenue.totalRevenue,
        previous: prevRevenue.totalRevenue,
        percentChange: calculatePercentChange(prevRevenue.totalRevenue, currentRevenue.totalRevenue),
      },
      exams: {
        current: currentExams,
        previous: prevExams,
        percentChange: calculatePercentChange(prevExams, currentExams),
      },
    };
  } catch (err) {
    console.error('getMonthlyComparison error:', err);
    throw err;
  }
};

/**
 * Phân bổ bệnh nhân theo khoa
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 */
const getDepartmentBreakdown = async (fromDate, toDate) => {
  try {
    const result = await knex('LichHen')
      .select('Khoa.idKhoa', 'Khoa.tenKhoa')
      .count('LichHen.idBenhNhan as patientCount')
      .join('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .where('LichHen.ngayHen', '>=', fromDate)
      .where('LichHen.ngayHen', '<=', toDate)
      .where('LichHen.trangThai', '!=', 'huy')
      .groupBy('Khoa.idKhoa', 'Khoa.tenKhoa')
      .orderBy('patientCount', 'desc');

    return result || [];
  } catch (err) {
    console.error('getDepartmentBreakdown error:', err);
    throw err;
  }
};

/**
 * Chi tiết hiệu suất bác sĩ (doctor performance detail)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getDoctorPerformance = async (fromDate, toDate, idKhoa = null) => {
  try {
    let query = knex('LichHen')
      .select(
        'BacSi.idBacSi',
        'BacSi.hoTen',
        'BacSi.chuyenKhoa',
        'Khoa.tenKhoa'
      )
      .count('LichHen.idLichHen as appointmentCount')
      .join('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
      .join('Khoa', 'BacSi.idKhoa', 'Khoa.idKhoa')
      .where('LichHen.ngayHen', '>=', fromDate)
      .where('LichHen.ngayHen', '<=', toDate)
      .where('LichHen.trangThai', '!=', 'huy')
      .groupBy('BacSi.idBacSi', 'BacSi.hoTen', 'BacSi.chuyenKhoa', 'Khoa.tenKhoa')
      .orderBy('appointmentCount', 'desc');

    if (idKhoa) {
      query = query.where('Khoa.idKhoa', idKhoa);
    }

    const result = await query;
    return result || [];
  } catch (err) {
    console.error('getDoctorPerformance error:', err);
    throw err;
  }
};

/**
 * Lấy dữ liệu doanh thu hàng ngày (for line chart)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getDailyRevenueData = async (fromDate, toDate, idKhoa = null) => {
  try {
    let query = knex('ThanhToan')
      .select(knex.raw('DATE(ngayTao) as date'))
      .sum('soTienCoc as revenue')
      .count('* as paymentCount')
      .where('ThanhToan.ngayTao', '>=', `${fromDate} 00:00:00`)
      .where('ThanhToan.ngayTao', '<=', `${toDate} 23:59:59`)
      .where('ThanhToan.trangThai', '!=', 'tra_lai')
      .groupBy(knex.raw('DATE(ngayTao)'))
      .orderBy('date', 'asc');

    if (idKhoa) {
      query = query
        .leftJoin('LichHen', 'ThanhToan.idLichHen', 'LichHen.idLichHen')
        .leftJoin('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
        .where(builder => {
          builder
            .where('BacSi.idKhoa', idKhoa)
            .orWhereNull('LichHen.idLichHen');
        });
    }

    const result = await query;
    return (result || []).map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue) || 0,
      paymentCount: row.paymentCount || 0,
    }));
  } catch (err) {
    console.error('getDailyRevenueData error:', err);
    throw err;
  }
};

/**
 * Tổng quan đầy đủ (overview with all 4 core metrics)
 * @param {string} fromDate - YYYY-MM-DD format
 * @param {string} toDate - YYYY-MM-DD format
 * @param {string} idKhoa - optional department filter
 */
const getOverview = async (fromDate, toDate, idKhoa = null) => {
  try {
    const [bookings, revenue, exams, doctorShifts] = await Promise.all([
      getBookingStatistics(fromDate, toDate, idKhoa),
      getDepositRevenue(fromDate, toDate, idKhoa),
      getExaminationStatistics(fromDate, toDate, idKhoa),
      getDoctorExamCountByShift(fromDate, toDate, idKhoa),
    ]);

    // Sum total exams from shift breakdown
    const totalExamsByShift = doctorShifts.reduce((sum, shift) => sum + parseInt(shift.examCount || 0), 0);

    return {
      dateRange: { fromDate, toDate },
      metrics: {
        totalBookings: bookings,
        totalRevenue: revenue.totalRevenue,
        totalExaminations: exams,
        totalExamsByShift: totalExamsByShift,
        totalPayments: revenue.totalPayments,
      },
      departmentFilter: idKhoa || 'all',
    };
  } catch (err) {
    console.error('getOverview error:', err);
    throw err;
  }
};

// Helper functions

/**
 * Calculate percent change between two values
 */
const calculatePercentChange = (previous, current) => {
  if (!previous || previous === 0) {
    return current ? 100 : 0;
  }
  return ((current - previous) / previous * 100).toFixed(1);
};

/**
 * Get first and last day of month in YYYY-MM-DD format
 */
const getMonthDateRange = (yearMonth) => {
  const [year, month] = yearMonth.split('-');
  const firstDay = new Date(year, parseInt(month) - 1, 1);
  const lastDay = new Date(year, parseInt(month), 0);

  const fromDate = firstDay.toISOString().split('T')[0];
  const toDate = lastDay.toISOString().split('T')[0];

  return [fromDate, toDate];
};

module.exports = {
  getBookingStatistics,
  getDepositRevenue,
  getExaminationStatistics,
  getDoctorExamCountByShift,
  getMonthlyComparison,
  getDepartmentBreakdown,
  getDoctorPerformance,
  getDailyRevenueData,
  getOverview,
};
