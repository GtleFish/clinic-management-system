import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyRevenue } from '@/services/statisticsService';

interface RevenueLineChartProps {
  data: DailyRevenue[];
  loading?: boolean;
}

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function RevenueLineChart({
  data,
  loading = false,
}: RevenueLineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Doanh thu từ tiền cọc theo ngày</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(value: number) => formatVND(value)}
                labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2D9B7D"
                strokeWidth={2}
                dot={{ fill: '#2D9B7D', r: 4 }}
                activeDot={{ r: 6 }}
                name="Doanh thu"
              />
            </LineChart>
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
