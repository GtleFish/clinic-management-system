import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentData } from '@/services/statisticsService';

interface DepartmentChartProps {
  data: DepartmentData[];
  loading?: boolean;
}

const COLORS = [
  '#2D9B7D',
  '#3FA89A',
  '#4DB5B7',
  '#5BC2D4',
  '#69CFF1',
  '#77DCFF',
  '#16A34A',
  '#EA580C',
];

export default function DepartmentChart({ data, loading = false }: DepartmentChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Phân bổ bệnh nhân theo khoa</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, patients }) => `${department}: ${patients}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="patients"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} bệnh nhân`} />
              <Legend />
            </PieChart>
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
