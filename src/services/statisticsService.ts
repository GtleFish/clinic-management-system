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
    return response.data;
  },

  async getRevenueData(
    startDate: string,
    endDate: string,
    idKhoa?: string
  ): Promise<DailyRevenue[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/revenue', { params });
    return response.data;
  },

  async getMonthlyComparison(idKhoa?: string): Promise<MonthlyComparison> {
    const params = new URLSearchParams();
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/comparison', {
      params,
    });
    return response.data;
  },

  async getDoctorShiftStats(
    startDate?: string,
    endDate?: string,
    idKhoa?: string
  ): Promise<DoctorShiftData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/doctor-shift', {
      params,
    });
    return response.data;
  },

  async getDepartmentStats(
    startDate?: string,
    endDate?: string
  ): Promise<DepartmentData[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get('/api/admin/statistics/departments', {
      params,
    });
    return response.data;
  },

  async getDoctorPerformance(
    startDate?: string,
    endDate?: string,
    idKhoa?: string
  ): Promise<DoctorPerformance[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (idKhoa) params.append('idKhoa', idKhoa);

    const response = await api.get('/api/admin/statistics/doctor-detail', {
      params,
    });
    return response.data;
  },
};

export default statisticsService;