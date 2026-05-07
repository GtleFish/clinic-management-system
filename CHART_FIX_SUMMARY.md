# Tóm tắt sửa lỗi Charts không hiển thị dữ liệu

## Vấn đề
Các biểu đồ và bảng trong ReportPage không hiển thị dữ liệu vì **field names không khớp** giữa API response và component expectations.

## Nguyên nhân
Components được thiết kế với field names khác với những gì backend API trả về:

| Component | Expected Fields | API Response Fields |
|-----------|----------------|---------------------|
| ComparisonBarChart | `thisMonth`, `lastMonth`, `percentChange` | `data.revenue.current`, `data.revenue.previous`, `data.revenue.percentChange` |
| DoctorShiftChart | `shift`, `count` | `gioHen`, `examCount` |
| DepartmentChart | `department`, `patients` | `tenKhoa`, `patientCount` |
| DoctorPerformanceTable | `doctorId`, `doctorName`, `department`, `examCount` | `idBacSi`, `hoTen`, `tenKhoa`, `appointmentCount` |

## Giải pháp đã áp dụng

### 1. ComparisonBarChart.tsx
**Trước:**
```typescript
const chartData = [
  { name: 'Tháng này', value: data.thisMonth },
  { name: 'Tháng trước', value: data.lastMonth },
];
```

**Sau:**
```typescript
const { revenue } = data.data;
const chartData = [
  { name: 'Tháng trước', value: revenue.previous },
  { name: 'Tháng này', value: revenue.current },
];
```

### 2. DoctorShiftChart.tsx
**Trước:**
```typescript
const chartData = data.map((item) => ({
  ...item,
  shiftName: shiftLabels[item.shift] || item.shift,
}));
```

**Sau:**
```typescript
const chartData = data.map((item) => ({
  shiftName: item.gioHen, // Giờ hẹn
  count: parseInt(item.examCount.toString()),
  doctorName: item.hoTen,
  department: item.tenKhoa,
}));
```

### 3. DepartmentChart.tsx
**Trước:**
```typescript
// Sử dụng trực tiếp data với fields không tồn tại
<Pie data={data} dataKey="patients" />
```

**Sau:**
```typescript
const chartData = data.map((item) => ({
  department: item.tenKhoa,
  patients: parseInt(item.patientCount.toString()),
  idKhoa: item.idKhoa,
}));
<Pie data={chartData} dataKey="patients" />
```

### 4. DoctorPerformanceTable.tsx
**Trước:**
```typescript
<TableRow key={doctor.doctorId}>
  <TableCell>{doctor.doctorName}</TableCell>
  <TableCell>{doctor.department}</TableCell>
  <TableCell>{doctor.examCount}</TableCell>
</TableRow>
```

**Sau:**
```typescript
<TableRow key={doctor.idBacSi}>
  <TableCell>{doctor.hoTen}</TableCell>
  <TableCell>{doctor.chuyenKhoa}</TableCell>
  <TableCell>{doctor.tenKhoa}</TableCell>
  <TableCell>{doctor.appointmentCount}</TableCell>
</TableRow>
```

## Các cải tiến bổ sung

### ComparisonBarChart
- ✅ Thêm null check cho `data` và `data.data`
- ✅ Hiển thị message "Không có dữ liệu" khi data null
- ✅ Sử dụng đúng structure từ API: `data.data.revenue`

### DoctorShiftChart
- ✅ Transform data với field names chính xác
- ✅ Parse `examCount` thành integer
- ✅ Giữ thông tin bác sĩ và khoa trong chartData

### DepartmentChart
- ✅ Transform data trước khi truyền vào PieChart
- ✅ Parse `patientCount` thành integer
- ✅ Giữ `idKhoa` để làm unique key

### DoctorPerformanceTable
- ✅ Thêm cột "Chuyên khoa" để hiển thị đầy đủ thông tin
- ✅ Sử dụng đúng field names từ API
- ✅ Update colspan từ 3 thành 4 cho empty state

## Cách test

### 1. Chạy seed data
```bash
cd server
npx knex seed:run
```

### 2. Khởi động server và frontend
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 3. Kiểm tra ReportPage
1. Đăng nhập với admin: `admin@gmail.com` / `Admin@123`
2. Vào "Báo cáo thống kê"
3. Kiểm tra các biểu đồ:
   - ✅ So sánh doanh thu (Bar chart với 2 cột)
   - ✅ Số lần bác sĩ khám theo ca (Bar chart theo giờ)
   - ✅ Phân bổ bệnh nhân theo khoa (Pie chart)
   - ✅ Hiệu suất bác sĩ (Table với 4 cột)

### 4. Test với filter
- Thử đổi khoảng thời gian (Hàng ngày, Hàng tuần, Hàng tháng)
- Thử filter theo khoa
- Kiểm tra dữ liệu cập nhật đúng

## Debug tips

### Nếu vẫn không có dữ liệu:

1. **Kiểm tra Console Browser:**
```javascript
// Mở DevTools > Console
// Xem có lỗi API không
```

2. **Kiểm tra Network Tab:**
```
- Xem các API calls có status 200 không
- Xem response data có đúng format không
```

3. **Kiểm tra Database:**
```sql
-- Kiểm tra có dữ liệu trong 30 ngày gần đây
SELECT COUNT(*) FROM LichHen 
WHERE ngayHen >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

SELECT COUNT(*) FROM ThanhToan 
WHERE ngayTao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

4. **Kiểm tra Server Logs:**
```bash
# Xem server console có lỗi query không
```

## API Response Examples

### Overview
```json
{
  "bookingCount": 28,
  "depositRevenue": 8500000,
  "examinationCount": 28,
  "doctorExamCount": 28
}
```

### Doctor Shift
```json
{
  "data": [
    {
      "gioHen": "08:00:00",
      "idBacSi": "BS-001",
      "hoTen": "Nguyễn Văn An",
      "tenKhoa": "Nội khoa",
      "examCount": 5
    }
  ]
}
```

### Department Stats
```json
{
  "data": [
    {
      "idKhoa": "dept-1",
      "tenKhoa": "Nội khoa",
      "patientCount": 12
    }
  ]
}
```

### Doctor Performance
```json
{
  "data": [
    {
      "idBacSi": "BS-001",
      "hoTen": "Nguyễn Văn An",
      "chuyenKhoa": "Tim mạch",
      "tenKhoa": "Nội khoa",
      "appointmentCount": 8
    }
  ]
}
```

### Monthly Comparison
```json
{
  "data": {
    "currentMonth": "2026-04",
    "previousMonth": "2026-03",
    "bookings": {
      "current": 15,
      "previous": 12,
      "percentChange": 25.0
    },
    "revenue": {
      "current": 4500000,
      "previous": 3600000,
      "percentChange": 25.0
    },
    "exams": {
      "current": 15,
      "previous": 12,
      "percentChange": 25.0
    }
  }
}
```

## Kết luận

Tất cả các biểu đồ và bảng đã được sửa để khớp với API response structure. Dữ liệu sẽ hiển thị đúng sau khi:
1. ✅ Chạy seed data
2. ✅ Refresh trang ReportPage
3. ✅ Đảm bảo có dữ liệu trong khoảng thời gian được chọn
