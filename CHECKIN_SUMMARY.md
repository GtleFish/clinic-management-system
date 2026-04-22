# Tóm tắt: Tính năng Check-in tự động tạo Thanh toán

## ✅ Đã hoàn thành

### Backend Changes

1. **adminController.js**
   - ✅ Cập nhật `checkInLichHen()`: Tự động tạo/cập nhật thanh toán khi check-in
   - ✅ Thêm `getPaymentByLichHen()`: API lấy thông tin thanh toán của lịch hẹn
   - ✅ Cập nhật `getTatCaLichHen()`: Thêm thông tin thanh toán vào danh sách lịch hẹn

2. **admin.js (routes)**
   - ✅ Thêm route: `GET /api/admin/lich-hen/:idLichHen/thanh-toan`

## Cách hoạt động

### Khi admin check-in:
```
1. Cập nhật trạng thái lịch hẹn: dang_cho → cho_kham
2. Kiểm tra thanh toán:
   - Nếu ĐÃ CÓ: Cập nhật trạng thái + số tiền
   - Nếu CHƯA CÓ: Tạo mới với số tiền mặc định 300k
3. Ghi nhận vào doanh thu (trangThai = 'da_coc')
```

## API Usage

### Check-in với tiền cọc mặc định (300k)
```bash
PATCH /api/admin/lich-hen/:idLichHen/checkin
```

### Check-in với tiền cọc tùy chỉnh
```bash
PATCH /api/admin/lich-hen/:idLichHen/checkin
Content-Type: application/json

{
  "soTienCoc": 500000
}
```

### Kiểm tra thanh toán
```bash
GET /api/admin/lich-hen/:idLichHen/thanh-toan
```

## Response Example

```json
{
  "message": "Check-in thành công. Tiền cọc đã được ghi nhận vào doanh thu.",
  "payment": {
    "idThanhToan": "TT-ABC12345",
    "soTienCoc": 500000,
    "isNew": true
  }
}
```

## Tích hợp với Doanh thu

- ✅ Thanh toán được tạo với `trangThai = 'da_coc'`
- ✅ `ngayThanhToan` = thời điểm check-in
- ✅ Tự động tính vào báo cáo doanh thu
- ✅ Query doanh thu lọc theo `ngayTao` hoặc `ngayThanhToan`

## Transaction Safety

```javascript
await knex.transaction(async (trx) => {
  // 1. Update LichHen
  // 2. Create/Update ThanhToan
  // Nếu lỗi → rollback cả 2
});
```

## Testing

```bash
# 1. Khởi động server
cd server
npm run dev

# 2. Test check-in
curl -X PATCH http://localhost:5000/api/admin/lich-hen/LH-001/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"soTienCoc": 500000}'

# 3. Kiểm tra doanh thu
curl -X GET "http://localhost:5000/api/admin/statistics/overview?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer <token>"
```

## Lưu ý

- ⚠️ Không cho phép check-in lại nếu đã check-in
- ⚠️ Không cho phép check-in lịch hẹn đã hủy
- ✅ Số tiền cọc có thể tùy chỉnh qua request body
- ✅ Mặc định 300,000đ nếu không truyền
- ✅ Hỗ trợ cả trường hợp đã có thanh toán trước (cập nhật) và chưa có (tạo mới)
