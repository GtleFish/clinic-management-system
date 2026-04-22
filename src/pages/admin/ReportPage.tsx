import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, DollarSign, Stethoscope, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import FilterBar from '@/components/admin/FilterBar';
import StatsCard from '@/components/admin/StatsCard';
import RevenueLineChart from '@/components/admin/RevenueLineChart';
import ComparisonBarChart from '@/components/admin/ComparisonBarChart';
import DoctorShiftChart from '@/components/admin/DoctorShiftChart';
import DepartmentChart from '@/components/admin/DepartmentChart';
import DoctorPerformanceTable from '@/components/admin/DoctorPerformanceTable';

import statisticsService from '@/services/statisticsService';

// Tính default date range: 1 tháng gần nhất
const getDefaultDates = () => {
  const today = new Date();
  const from = new Date();
  from.setMonth(today.getMonth() - 1);
  return {
    start: from.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  };
};

const ReportPage: React.FC = () => {
  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [idKhoa, setIdKhoa] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [doctorShiftData, setDoctorShiftData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [doctorPerformance, setDoctorPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gọi API khi filter thay đổi
  const fetchAllData = async (from = startDate, to = endDate, khoa = idKhoa) => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const [overviewRes, revenueRes, comparisonRes, doctorShiftRes, deptRes, doctorPerfRes] =
        await Promise.all([
          statisticsService.getOverview(from, to, khoa || undefined),
          statisticsService.getRevenueData(from, to, khoa || undefined),
          statisticsService.getMonthlyComparison(khoa || undefined),
          statisticsService.getDoctorShiftStats(from, to, khoa || undefined),
          statisticsService.getDepartmentStats(from, to),
          statisticsService.getDoctorPerformance(from, to, khoa || undefined),
        ]);

      setOverview(overviewRes);
      setRevenueData(revenueRes);
      setComparisonData(comparisonRes);
      setDoctorShiftData(doctorShiftRes);
      setDepartmentData(deptRes);
      setDoctorPerformance(doctorPerfRes);
    } catch (error) {
      console.error('Lỗi tải báo cáo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(startDate, endDate, idKhoa);
  }, [startDate, endDate, idKhoa]);

  const handleDateRangeChange = useCallback((newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  const handleDepartmentChange = useCallback((newIdKhoa: string | null) => {
    setIdKhoa(newIdKhoa);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Báo cáo thống kê & Doanh thu</h1>
              <p className="text-gray-500 mt-1">Theo dõi hoạt động khám chữa bệnh và doanh thu cọc</p>
            </div>
          </div>
          <Button onClick={() => fetchAllData()} disabled={loading}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* FilterBar */}
        <FilterBar
          onDateRangeChange={handleDateRangeChange}
          onDepartmentChange={handleDepartmentChange}
          onPeriodChange={() => {}}
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