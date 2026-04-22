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
  paymentCount: number;
}

export interface MonthlyComparison {
  data: {
    currentMonth: string;
    previousMonth: string;
    bookings: { current: number; previous: number; percentChange: number };
    revenue:  { current: number; previous: number; percentChange: number };
    exams:    { current: number; previous: number; percentChange: number };
  };
}

export interface DoctorShiftData {
  gioHen: string;
  idBacSi: string;
  hoTen: string;
  tenKhoa: string;
  examCount: number;
}

export interface DepartmentData {
  idKhoa: string;
  tenKhoa: string;
  patientCount: number;
}

export interface DoctorPerformance {
  idBacSi: string;
  hoTen: string;
  chuyenKhoa: string;
  tenKhoa: string;
  appointmentCount: number;
}

const statisticsService = {
  async getOverview(
    startDate: string,
    endDate: string,
    idKhoa?: string
  ): Promise<StatisticsOverview> {
    const params: Record<string, string> = { startDate, endDate };
    if (idKhoa) params.idKhoa = idKhoa;
    const response = await api.get('/admin/statistics/overview', { params });
    return response.data;
  },

  async getRevenueData(
    startDate: string,
    endDate: string,
    idKhoa?: string
  ): Promise<DailyRevenue[]> {
    const params: Record<string, string> = { startDate, endDate };
    if (idKhoa) params.idKhoa = idKhoa;
    const response = await api.get('/admin/statistics/revenue', { params });
    // Backend trả về array trực tiếp
    return Array.isArray(response.data) ? response.data : [];
  },

  async getMonthlyComparison(idKhoa?: string): Promise<MonthlyComparison> {
    // Tính tháng hiện tại và tháng trước
    const now = new Date();
    const month1 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month2 = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    const params: Record<string, string> = { month1, month2 };
    if (idKhoa) params.idKhoa = idKhoa;
    const response = await api.get('/admin/statistics/comparison', { params });
    return response.data;
  },

  async getDoctorShiftStats(
    startDate: string,
    endDate: string,
    idKhoa?: string
  ): Promise<DoctorShiftData[]> {
    // Backend nhận fromDate/toDate
    const params: Record<string, string> = { fromDate: startDate, toDate: endDate };
    if (idKhoa) params.idKhoa = idKhoa;
    const response = await api.get('/admin/statistics/doctor-shift', { params });
    return response.data?.data || [];
  },

  async getDepartmentStats(
    startDate: string,
    endDate: string
  ): Promise<DepartmentData[]> {
    const params: Record<string, string> = { fromDate: startDate, toDate: endDate };
    const response = await api.get('/admin/statistics/departments', { params });
    return response.data?.data || [];
  },

  async getDoctorPerformance(
    startDate: string,
    endDate: string,
    idKhoa?: string
  ): Promise<DoctorPerformance[]> {
    const params: Record<string, string> = { fromDate: startDate, toDate: endDate };
    if (idKhoa) params.idKhoa = idKhoa;
    const response = await api.get('/admin/statistics/doctor-detail', { params });
    return response.data?.data || [];
  },
};

export default statisticsService;
