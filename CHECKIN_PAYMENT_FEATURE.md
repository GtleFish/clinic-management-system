# Tính năng Check-in tự động tạo Thanh toán

## Tổng quan
Khi admin check-in một lịch hẹn, hệ thống sẽ tự động tạo/cập nhật bản ghi thanh toán để ghi nhận tiền cọc vào doanh thu.

## Luồng hoạt động

### 1. Check-in lịch hẹn
**Endpoint:** `PATCH /api/admin/lich-hen/:idLichHen/checkin`

**Request Body (optional):**
```json
{
  "soTienCoc": 500000
}
```

**Luồng xử lý:**

1. **Kiểm tra lịch hẹn:**
   - Lịch hẹn có tồn tại không?
   - Lịch hẹn đã bị hủy chưa?
   - Lịch hẹn đã được check-in chưa?

2. **Cập nhật trạng thái lịch hẹn:**
   - Đổi trạng thái từ `dang_cho` → `cho_kham`

3. **Xử lý thanh toán:**
   
   **Trường hợp A: Đã có thanh toán**
   - Cập nhật trạng thái thành `da_coc`
   - Cập nhật số tiền cọc (nếu có trong request)
   - Cập nhật `ngayThanhToan` = thời điểm hiện tại
   - Cập nhật `ghiChu`

   **Trường hợp B: Chưa có thanh toán**
   - Tạo mới bản ghi `ThanhToan`
   - `soTienCoc`: Từ request hoặc mặc định 300,000đ
   - `loaiThanhToan`: `khi_den_kham`
   - `trangThai`: `da_coc`
   - `ngayTao` và `ngayThanhToan`: Thời điểm hiện tại

4. **Trả về kết quả:**
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

## API Endpoints

### 1. Check-in lịch hẹn
```http
PATCH /api/admin/lich-hen/:idLichHen/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "soTienCoc": 500000  // Optional, mặc định 300000
}
```

**Response Success (200):**
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

**Response Error:**
- `404`: Không tìm thấy lịch hẹn
- `400`: Lịch hẹn đã bị hủy / đã check-in / số tiền không hợp lệ
- `500`: Lỗi server

### 2. Lấy thông tin thanh toán của lịch hẹn
```http
GET /api/admin/lich-hen/:idLichHen/thanh-toan
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "hasPayment": true,
  "data": {
    "idThanhToan": "TT-ABC12345",
    "idBenhNhan": "BN-001",
    "idLichHen": "LH-001",
    "soTienCoc": 500000,
    "loaiThanhToan": "khi_den_kham",
    "trangThai": "da_coc",
    "ngayTao": "2026-04-22T10:30:00.000Z",
    "ngayThanhToan": "2026-04-22T10:30:00.000Z",
    "ghiChu": "Tiền cọc 500,000đ khi check-in"
  }
}
```

**Response Not Found (404):**
```json
{
  "message": "Chưa có thông tin thanh toán cho lịch hẹn này",
  "hasPayment": false
}
```

### 3. Lấy danh sách lịch hẹn (có thông tin thanh toán)
```http
GET /api/admin/lich-hen/all
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "data": [
    {
      "idLichHen": "LH-001",
      "ngayHen": "2026-04-22",
      "gioHen": "08:00:00",
      "trangThai": "cho_kham",
      "hoTenBenhNhan": "Nguyễn Văn A",
      "soDienThoai": "0901234567",
      "hoTenBacSi": "Nguyễn Văn An",
      "tenKhoa": "Nội khoa",
      "idThanhToan": "TT-ABC12345",
      "soTienCoc": 500000,
      "trangThaiThanhToan": "da_coc"
    }
  ]
}
```

## Database Schema

### Bảng ThanhToan
```sql
CREATE TABLE ThanhToan (
  idThanhToan VARCHAR(50) PRIMARY KEY,
  idBenhNhan VARCHAR(50) NOT NULL,
  idLichHen VARCHAR(50),
  soTienCoc DECIMAL(15,2) NOT NULL,
  loaiThanhToan VARCHAR(50) NOT NULL,
  trangThai VARCHAR(50) NOT NULL,
  ngayTao DATETIME NOT NULL,
  ngayThanhToan DATETIME,
  ghiChu TEXT,
  FOREIGN KEY (idBenhNhan) REFERENCES BenhNhan(idBenhNhan),
  FOREIGN KEY (idLichHen) REFERENCES LichHen(idLichHen)
);
```

### Các trạng thái thanh toán
- `da_coc`: Đã cọc (tiền đã được ghi nhận vào doanh thu)
- `thanh_toan_du`: Đã thanh toán đủ
- `tra_lai`: Đã trả lại tiền cọc (không tính vào doanh thu)

### Các loại thanh toán
- `khi_dat_lich`: Thanh toán khi đặt lịch (online)
- `khi_den_kham`: Thanh toán khi đến khám (tại quầy)

## Tích hợp với Báo cáo Doanh thu

### Query doanh thu
```javascript
// Trong statisticsService.js
const getDepositRevenue = async (fromDate, toDate, idKhoa = null) => {
  let query = knex('ThanhToan')
    .sum('soTienCoc as totalRevenue')
    .count('* as totalPayments')
    .where('ThanhToan.ngayTao', '>=', `${fromDate} 00:00:00`)
    .where('ThanhToan.ngayTao', '<=', `${toDate} 23:59:59`)
    .where('ThanhToan.trangThai', '!=', 'tra_lai'); // Không tính tiền đã trả lại

  // ... filter by department if needed
  
  return result;
};
```

### Lưu ý quan trọng
- ✅ Chỉ tính doanh thu từ các thanh toán có trạng thái `da_coc` hoặc `thanh_toan_du`
- ✅ Không tính các thanh toán có trạng thái `tra_lai`
- ✅ Sử dụng `ngayTao` hoặc `ngayThanhToan` để lọc theo khoảng thời gian
- ✅ Khi check-in, `ngayThanhToan` được set = thời điểm check-in

## Use Cases

### Use Case 1: Check-in với tiền cọc mặc định
```javascript
// Frontend
const checkIn = async (idLichHen) => {
  const response = await api.patch(`/admin/lich-hen/${idLichHen}/checkin`);
  // Tiền cọc mặc định 300,000đ sẽ được tạo tự động
};
```

### Use Case 2: Check-in với tiền cọc tùy chỉnh
```javascript
// Frontend
const checkInWithCustomDeposit = async (idLichHen, amount) => {
  const response = await api.patch(`/admin/lich-hen/${idLichHen}/checkin`, {
    soTienCoc: amount
  });
};
```

### Use Case 3: Kiểm tra thanh toán trước khi check-in
```javascript
// Frontend
const checkPaymentBeforeCheckIn = async (idLichHen) => {
  try {
    const paymentResponse = await api.get(`/admin/lich-hen/${idLichHen}/thanh-toan`);
    
    if (paymentResponse.data.hasPayment) {
      // Đã có thanh toán, hiển thị thông tin
      console.log('Đã có thanh toán:', paymentResponse.data.data);
    } else {
      // Chưa có thanh toán, cho phép nhập số tiền
      const amount = prompt('Nhập số tiền cọc:');
      await checkInWithCustomDeposit(idLichHen, amount);
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
```

## Testing

### Test Case 1: Check-in lần đầu (chưa có thanh toán)
```bash
# Request
curl -X PATCH http://localhost:5000/api/admin/lich-hen/LH-001/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"soTienCoc": 500000}'

# Expected: Tạo mới bản ghi ThanhToan với soTienCoc = 500000
```

### Test Case 2: Check-in lần 2 (đã có thanh toán)
```bash
# Request
curl -X PATCH http://localhost:5000/api/admin/lich-hen/LH-001/checkin \
  -H "Authorization: Bearer <token>"

# Expected: Cập nhật bản ghi ThanhToan hiện có, không tạo mới
```

### Test Case 3: Kiểm tra doanh thu sau check-in
```bash
# Request
curl -X GET "http://localhost:5000/api/admin/statistics/overview?startDate=2026-04-01&endDate=2026-04-30" \
  -H "Authorization: Bearer <token>"

# Expected: depositRevenue tăng lên sau khi check-in
```

## Transaction Safety

Hệ thống sử dụng **database transaction** để đảm bảo:
- ✅ Cập nhật lịch hẹn và tạo/cập nhật thanh toán là atomic
- ✅ Nếu có lỗi, cả 2 thao tác đều rollback
- ✅ Không có trường hợp lịch hẹn đã check-in nhưng không có thanh toán

```javascript
await knex.transaction(async (trx) => {
  // 1. Update LichHen
  await trx('LichHen').where({ idLichHen }).update({ trangThai: 'cho_kham' });
  
  // 2. Create/Update ThanhToan
  // ...
  
  // Nếu có lỗi ở bất kỳ bước nào, cả 2 đều rollback
});
```

## Troubleshooting

### Vấn đề: Check-in thành công nhưng không thấy doanh thu
**Nguyên nhân:** Query doanh thu có thể đang filter theo ngày không đúng

**Giải pháp:**
```sql
-- Kiểm tra bản ghi thanh toán
SELECT * FROM ThanhToan 
WHERE idLichHen = 'LH-001';

-- Kiểm tra ngày tạo
SELECT ngayTao, ngayThanhToan, soTienCoc 
FROM ThanhToan 
WHERE DATE(ngayTao) = CURDATE();
```

### Vấn đề: Duplicate thanh toán
**Nguyên nhân:** Check-in nhiều lần

**Giải pháp:** Hệ thống đã xử lý bằng cách:
- Kiểm tra `existingPayment` trước khi tạo mới
- Chỉ cập nhật nếu đã tồn tại
- Không cho phép check-in lại nếu trạng thái đã là `cho_kham`

## Kết luận

Tính năng này đảm bảo:
- ✅ Mỗi lần check-in đều có bản ghi thanh toán tương ứng
- ✅ Doanh thu được ghi nhận chính xác
- ✅ Hỗ trợ cả tiền cọc mặc định và tùy chỉnh
- ✅ Transaction safety đảm bảo tính nhất quán dữ liệu
- ✅ Tích hợp hoàn chỉnh với hệ thống báo cáo
