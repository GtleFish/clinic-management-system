import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoctorPerformance } from '@/services/statisticsService';

interface DoctorPerformanceTableProps {
  data: DoctorPerformance[];
  loading?: boolean;
}

export default function DoctorPerformanceTable({
  data,
  loading = false,
}: DoctorPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hiệu suất bác sĩ</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bác sĩ</TableHead>
                  <TableHead>Chuyên khoa</TableHead>
                  <TableHead>Khoa</TableHead>
                  <TableHead className="text-right">Số lần khám</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((doctor) => (
                    <TableRow key={doctor.idBacSi}>
                      <TableCell className="font-medium">{doctor.hoTen}</TableCell>
                      <TableCell>{doctor.chuyenKhoa}</TableCell>
                      <TableCell>{doctor.tenKhoa}</TableCell>
                      <TableCell className="text-right">{doctor.appointmentCount}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
