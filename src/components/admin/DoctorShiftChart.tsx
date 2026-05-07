import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorShiftData } from '@/services/statisticsService';

interface DoctorShiftChartProps {
  data: DoctorShiftData[];
  loading?: boolean;
}

export default function DoctorShiftChart({ data, loading = false }: DoctorShiftChartProps) {
  // Transform API data to chart format
  const chartData = data.map((item) => ({
    shiftName: item.gioHen, // Sử dụng giờ hẹn làm tên ca
    count: parseInt(item.examCount.toString()), // Số lần khám
    doctorName: item.hoTen,
    department: item.tenKhoa,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Số lần bác sĩ khám theo ca</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shiftName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#2D9B7D"
                name="Số lần khám"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
