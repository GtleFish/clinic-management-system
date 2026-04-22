import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, DollarSign, Stethoscope, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import FilterBar from '@/components/admin/FilterBar';
import StatsCard from '@/components/admin/StatsCard';
import RevenueLineChart from '@/components/admin/RevenueLineChart';
import ComparisonBarChart from '@/components/admin/ComparisonBarChart';
import DoctorShiftChart from '@/components/admin/DoctorShiftChart';
import DepartmentChart from '@/components/admin/DepartmentChart';
import DoctorPerformanceTable from '@/components/admin/DoctorPerformanceTable';

import statisticsService from '@/services/statisticsService';

const ReportPage: React.FC = () => {
  // Khởi tạo với khoảng thời gian 1 tháng gần đây
  const getDefaultDateRange = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    return {
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [idKhoa, setIdKhoa] = useState<string | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "custom">("monthly");

  const [overview, setOverview] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [doctorShiftData, setDoctorShiftData] = useState<any>([]);
  const [departmentData, setDepartmentData] = useState<any>([]);
  const [doctorPerformance, setDoctorPerformance] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API khi filter thay đổi
  const fetchAllData = async () => {
    if (!startDate || !endDate) {
      console.warn('Thiếu startDate hoặc endDate');
      return;
    }
    
    setLoading(true);
    try {
      const [overviewRes, revenueRes, comparisonRes, doctorShiftRes, deptRes, doctorPerfRes] =
        await Promise.all([
          statisticsService.getOverview(startDate, endDate, idKhoa || undefined),
          statisticsService.getRevenueData(startDate, endDate, idKhoa || undefined),
          statisticsService.getMonthlyComparison(idKhoa || undefined),
          statisticsService.getDoctorShiftStats(startDate, endDate, idKhoa || undefined),
          statisticsService.getDepartmentStats(startDate, endDate),
          statisticsService.getDoctorPerformance(startDate, endDate, idKhoa || undefined),
        ]);

      setOverview(overviewRes);
      setRevenueData(revenueRes);
      setComparisonData(comparisonRes);
      setDoctorShiftData(doctorShiftRes);
      setDepartmentData(deptRes);
      setDoctorPerformance(doctorPerfRes);
    } catch (error) {
      console.error('Lỗi tải báo cáo:', error);
      // Hiển thị thông báo lỗi cho người dùng
      setOverview({ bookingCount: 0, depositRevenue: 0, examinationCount: 0, doctorExamCount: 0 });
      setRevenueData([]);
      setComparisonData(null);
      setDoctorShiftData([]);
      setDepartmentData([]);
      setDoctorPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchAllData();
    }
  }, [startDate, endDate, idKhoa]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Báo cáo thống kê & Doanh thu</h1>
            <p className="text-gray-500 mt-1">Theo dõi hoạt động khám chữa bệnh và doanh thu cọc</p>
          </div>
          <Button onClick={fetchAllData} disabled={loading}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* FilterBar */}
        <FilterBar
          onDateRangeChange={(newStartDate, newEndDate) => {
            setStartDate(newStartDate);
            setEndDate(newEndDate);
          }}
          onDepartmentChange={(newIdKhoa) => setIdKhoa(newIdKhoa)}
          onPeriodChange={setPeriod}
          departments={[]}
          isLoading={loading}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <StatsCard
            title="Số bệnh nhân đặt khám"
            value={overview?.bookingCount || 0}
            icon={<Users className="h-8 w-8" />}
            color="primary"
          />
          <StatsCard
            title="Doanh thu từ cọc"
            value={overview?.depositRevenue || 0}
            unit="đ"
            icon={<DollarSign className="h-8 w-8" />}
            color="success"
          />
          <StatsCard
            title="Số bệnh nhân khám"
            value={overview?.examinationCount || 0}
            icon={<Stethoscope className="h-8 w-8" />}
            color="primary"
          />
          <StatsCard
            title="Số lần khám theo ca"
            value={overview?.doctorExamCount || 0}
            icon={<Clock className="h-8 w-8" />}
            color="primary"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <RevenueLineChart data={revenueData} loading={loading} />
          {comparisonData && <ComparisonBarChart data={comparisonData} loading={loading} />}
          <DoctorShiftChart data={doctorShiftData} loading={loading} />
          <DepartmentChart data={departmentData} loading={loading} />
        </div>

        {/* Doctor Performance Table */}
        <div className="mt-8">
          <DoctorPerformanceTable data={doctorPerformance} loading={loading} />
        </div>
      </motion.div>
    </div>
  );
};

export default ReportPage;