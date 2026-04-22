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
import { MonthlyComparison } from '@/services/statisticsService';

interface ComparisonBarChartProps {
  data: MonthlyComparison;
  loading?: boolean;
}

const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getTrendColor = (percentChange: number) => {
  if (percentChange > 0) return '#22c55e';
  if (percentChange < 0) return '#ef4444';
  return '#2D9B7D';
};

export default function ComparisonBarChart({
  data,
  loading = false,
}: ComparisonBarChartProps) {
  if (!data || !data.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">So sánh doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Không có dữ liệu</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { revenue } = data.data;
  
  const chartData = [
    {
      name: 'Tháng trước',
      value: revenue.previous,
    },
    {
      name: 'Tháng này',
      value: revenue.current,
    },
  ];

  const trend = revenue.percentChange > 0 ? '↑' : revenue.percentChange < 0 ? '↓' : '→';
  const trendColor = getTrendColor(revenue.percentChange);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">So sánh doanh thu</CardTitle>
          <div style={{ color: trendColor }} className="text-sm font-semibold">
            {trend} {Math.abs(revenue.percentChange).toFixed(1)}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip formatter={(value: number) => formatVND(value)} />
              <Legend />
              <Bar dataKey="value" fill="#2D9B7D" name="Doanh thu" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
