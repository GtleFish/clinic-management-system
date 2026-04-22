import api from '@/lib/api';

export interface StatisticsOverview {
  bookingCount: number;
  depositRevenue: number;
  examinationCount: number;
  doctorExamCount: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface MonthlyComparison {
  thisMonth: number;
  lastMonth: number;
  percentChange: number;
}

export interface DoctorShiftData {
  shift: string;
  count: number;
}

export interface DepartmentData {
  department: string;
  patients: number;
}

export interface DoctorPerformance {
  doctorId: string;
  doctorName: string;
  examCount: number;
  department: string;
}

const statisticsService = {
  async getOverview(
    startDate?: string,
    endDate?: string,
    idKhoa?: string
  ): Promise<StatisticsOverview> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/overview', { params });
    // Backend trả về flat object: { bookingCount, depositRevenue, examinationCount, doctorExamCount }
    return response.data;
  },

  async getRevenueData(
    startDate: string,
    endDate: string,
    idKhoa?: string
  ): Promise<DailyRevenue[]> {
    const params = new URLSearchParams({ startDate, endDate });
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/revenue', { params });
    // Backend trả về array trực tiếp: [{ date, revenue, paymentCount }]
    return Array.isArray(response.data) ? response.data : [];
  },

  async getMonthlyComparison(idKhoa?: string): Promise<MonthlyComparison> {
    // Tính tháng hiện tại và tháng trước
    const now = new Date();
    const month1 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month2 = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const params = new URLSearchParams({ month1, month2 });
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/comparison', { params });
    // Backend trả về { data: { currentMonth, previousMonth, bookings, revenue, exams } }
    const raw = response.data?.data || response.data;
    return {
      thisMonth: raw?.revenue?.current ?? 0,
      lastMonth: raw?.revenue?.previous ?? 0,
      percentChange: parseFloat(raw?.revenue?.percentChange ?? 0),
    };
  },

  async getDoctorShiftStats(
    startDate?: string,
    endDate?: string,
    idKhoa?: string
  ): Promise<DoctorShiftData[]> {
    const params = new URLSearchParams();
    // Backend dùng fromDate/toDate
    if (startDate) params.append('fromDate', startDate);
    if (endDate) params.append('toDate', endDate);
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/doctor-shift', { params });
    // Backend trả về { data: [{ gioHen, idBacSi, hoTen, idKhoa, tenKhoa, examCount }] }
    const raw: any[] = response.data?.data ?? response.data ?? [];

    // Gom nhóm theo ca (giờ hẹn) và tổng hợp examCount
    const shiftMap: Record<string, number> = {};
    for (const item of raw) {
      const shift = item.gioHen ?? item.shift ?? 'Không rõ';
      shiftMap[shift] = (shiftMap[shift] || 0) + parseInt(item.examCount ?? item.count ?? 0);
    }
    return Object.entries(shiftMap).map(([shift, count]) => ({ shift, count }));
  },

  async getDepartmentStats(
    startDate?: string,
    endDate?: string
  ): Promise<DepartmentData[]> {
    const params = new URLSearchParams();
    // Backend dùng fromDate/toDate
    if (startDate) params.append('fromDate', startDate);
    if (endDate) params.append('toDate', endDate);

    const response = await api.get('/api/admin/statistics/departments', { params });
    // Backend trả về { data: [{ idKhoa, tenKhoa, patientCount }] }
    const raw: any[] = response.data?.data ?? response.data ?? [];
    return raw.map((item) => ({
      department: item.tenKhoa ?? item.department ?? '',
      patients: parseInt(item.patientCount ?? item.patients ?? 0),
    }));
  },

  async getDoctorPerformance(
    startDate?: string,
    endDate?: string,
    idKhoa?: string
  ): Promise<DoctorPerformance[]> {
    const params = new URLSearchParams();
    // Backend dùng fromDate/toDate
    if (startDate) params.append('fromDate', startDate);
    if (endDate) params.append('toDate', endDate);
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/doctor-detail', { params });
    // Backend trả về { data: [{ idBacSi, hoTen, chuyenKhoa, tenKhoa, appointmentCount }] }
    const raw: any[] = response.data?.data ?? response.data ?? [];
    return raw.map((item) => ({
      doctorId: item.idBacSi ?? item.doctorId ?? '',
      doctorName: item.hoTen ?? item.doctorName ?? '',
      examCount: parseInt(item.appointmentCount ?? item.examCount ?? 0),
      department: item.tenKhoa ?? item.department ?? '',
    }));
  },
};

export default statisticsService;
