# Hướng dẫn Fix ReportPage

## Các vấn đề đã sửa

### 1. Frontend Issues (ReportPage & FilterBar)
- ✅ **ReportPage**: Khởi tạo `startDate` và `endDate` với giá trị mặc định (1 tháng gần đây)
- ✅ **FilterBar**: Sửa infinite loop do dependency `onDateRangeChange` trong useEffect
- ✅ **Error handling**: Thêm xử lý lỗi khi API call thất bại

### 2. Backend Issues (statisticsService)
- ✅ **Trạng thái lịch hẹn**: Thêm `'da_kham'` vào danh sách trạng thái hợp lệ trong `getDoctorExamCountByShift`

### 3. Seed Data Issues
- ✅ **001_seed_data.js**: Thêm xóa bảng `ThanhToan` trước khi xóa `BenhNhan` (fix foreign key constraint)
- ✅ **seed-statistics-data.js**: 
  - Tạo 40 lịch hẹn phân bổ trong 90 ngày gần đây
  - 70% trạng thái `da_kham`, 20% `dang_cho`, 10% `huy`
  - Tạo lịch sử khám chỉ cho lịch hẹn đã khám
  - Tạo thanh toán cho lịch hẹn không bị hủy
  - Ngày thanh toán gần với ngày hẹn
- ✅ **create-more-patients.js**:
  - Thêm hàm `removeVietnameseTones()` để tạo email hợp lệ
  - Thêm hàm `calculateAge()` để tính tuổi chính xác
  - Thêm hàm `generateUniqueCCCD()` để tránh trùng lặp

## Cách chạy

### Bước 1: Chạy migrations và seeds
```bash
cd server
npx knex migrate:latest
npx knex seed:run
```

### Bước 2: Khởi động server
```bash
# Trong thư mục server
npm run dev
```

### Bước 3: Khởi động frontend
```bash
# Trong thư mục root
npm run dev
```

### Bước 4: Truy cập ReportPage
- Đăng nhập với tài khoản admin: `admin@gmail.com` / `Admin@123`
- Vào menu "Báo cáo thống kê"
- Trang sẽ tự động load dữ liệu 1 tháng gần đây

## Kiểm tra dữ liệu

Sau khi chạy seed, bạn có thể kiểm tra:

```sql
-- Kiểm tra số lượng lịch hẹn
SELECT trangThai, COUNT(*) as count 
FROM LichHen 
GROUP BY trangThai;

-- Kiểm tra lịch hẹn trong 30 ngày gần đây
SELECT COUNT(*) as count 
FROM LichHen 
WHERE ngayHen >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Kiểm tra thanh toán
SELECT trangThai, COUNT(*) as count, SUM(soTienCoc) as total 
FROM ThanhToan 
GROUP BY trangThai;

-- Kiểm tra lịch sử khám
SELECT COUNT(*) as count 
FROM LichSuKham 
WHERE ngayKham >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

## Các API endpoints

ReportPage sử dụng các API sau:

1. **GET /api/admin/statistics/overview** - Tổng quan 4 chỉ số
   - Query params: `startDate`, `endDate`, `idKhoa` (optional)

2. **GET /api/admin/statistics/revenue** - Doanh thu hàng ngày
   - Query params: `startDate`, `endDate`, `idKhoa` (optional)

3. **GET /api/admin/statistics/comparison** - So sánh 2 tháng
   - Query params: `month1`, `month2`, `idKhoa` (optional)

4. **GET /api/admin/statistics/doctor-shift** - Thống kê ca khám
   - Query params: `fromDate`, `toDate`, `idKhoa` (optional)

5. **GET /api/admin/statistics/departments** - Phân bổ theo khoa
   - Query params: `fromDate`, `toDate`

6. **GET /api/admin/statistics/doctor-detail** - Hiệu suất bác sĩ
   - Query params: `fromDate`, `toDate`, `idKhoa` (optional)

## Troubleshooting

### Nếu không có dữ liệu hiển thị:
1. Kiểm tra console browser để xem lỗi API
2. Kiểm tra server logs
3. Chạy lại seed: `npx knex seed:run`

### Nếu gặp lỗi foreign key:
```bash
# Chạy lại migrations từ đầu
npx knex migrate:rollback --all
npx knex migrate:latest
npx knex seed:run
```

### Nếu FilterBar không hoạt động:
- Xóa cache browser (Ctrl + Shift + R)
- Kiểm tra API `/api/admin/khoa` có trả về danh sách khoa không

## Các cải tiến đã thực hiện

1. **Performance**: Sử dụng `Promise.all()` để gọi API song song
2. **UX**: Hiển thị loading state và error handling
3. **Data Quality**: Seed data phân bổ đều trong 90 ngày, đa dạng trạng thái
4. **Consistency**: Đồng bộ trạng thái giữa frontend, backend và seed data
