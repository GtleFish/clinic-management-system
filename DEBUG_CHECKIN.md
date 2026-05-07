# Debug Check-in Issue

## Các bước debug

### 1. Chạy test script
```bash
cd server
node test-checkin.js
```

Script này sẽ:
- Tìm một lịch hẹn chưa check-in
- Thực hiện check-in
- Tạo/cập nhật thanh toán
- Hiển thị kết quả

### 2. Kiểm tra logs server
Khi gọi API check-in, xem console server để thấy:
```
checkInLichHen error: <error message>
Error stack: <stack trace>
```

### 3. Kiểm tra request từ frontend

**Mở DevTools > Network tab:**
- Tìm request `PATCH /api/admin/lich-hen/:idLichHen/checkin`
- Xem Status Code
- Xem Response

**Các lỗi thường gặp:**

#### Lỗi 404 - Không tìm thấy lịch hẹn
```json
{
  "message": "Không tìm thấy lịch hẹn"
}
```
**Nguyên nhân:** `idLichHen` không tồn tại trong database

**Giải pháp:**
```sql
SELECT * FROM LichHen WHERE idLichHen = 'LH-XXX';
```

#### Lỗi 400 - Lịch hẹn đã check-in
```json
{
  "message": "Lịch hẹn đã được check-in"
}
```
**Nguyên nhân:** Trạng thái đã là `cho_kham` hoặc `da_checkin`

**Giải pháp:**
```sql
-- Reset trạng thái để test lại
UPDATE LichHen 
SET trangThai = 'dang_cho' 
WHERE idLichHen = 'LH-XXX';
```

#### Lỗi 400 - Lịch hẹn đã hủy
```json
{
  "message": "Lịch hẹn đã bị hủy"
}
```
**Nguyên nhân:** Trạng thái là `huy`

**Giải pháp:** Chọn lịch hẹn khác hoặc reset trạng thái

#### Lỗi 500 - Lỗi server
```json
{
  "message": "Lỗi server, vui lòng thử lại",
  "error": "..."  // Chỉ hiện trong development mode
}
```

**Các nguyên nhân có thể:**

1. **Foreign key constraint:**
```
Cannot add or update a child row: a foreign key constraint fails
```
→ `idBenhNhan` hoặc `idLichHen` không tồn tại

2. **Duplicate key:**
```
Duplicate entry 'TT-XXX' for key 'PRIMARY'
```
→ `idThanhToan` bị trùng (rất hiếm)

3. **Column not found:**
```
Unknown column 'xxx' in 'field list'
```
→ Migration chưa chạy hoặc schema không đúng

### 4. Kiểm tra database

```sql
-- Kiểm tra lịch hẹn
SELECT * FROM LichHen WHERE idLichHen = 'LH-XXX';

-- Kiểm tra bệnh nhân
SELECT * FROM BenhNhan WHERE idBenhNhan = 'BN-XXX';

-- Kiểm tra thanh toán
SELECT * FROM ThanhToan WHERE idLichHen = 'LH-XXX';

-- Kiểm tra trạng thái lịch hẹn
SELECT idLichHen, trangThai, ngayHen, gioHen 
FROM LichHen 
ORDER BY ngayHen DESC 
LIMIT 10;
```

### 5. Test với curl

```bash
# Lấy token
TOKEN="your-jwt-token"

# Test check-in
curl -X PATCH http://localhost:5000/api/admin/lich-hen/LH-001/checkin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"soTienCoc": 500000}' \
  -v

# Kiểm tra response
```

### 6. Kiểm tra middleware

Đảm bảo body parser được cấu hình trong `app.js`:

```javascript
// server/src/app.js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 7. Kiểm tra route

```javascript
// server/src/routes/admin.js
router.patch('/lich-hen/:idLichHen/checkin', checkInLichHen);
```

Đảm bảo route được mount đúng:
```javascript
// server/src/app.js
app.use('/api/admin', adminRoutes);
```

## Common Issues & Solutions

### Issue 1: req.body is undefined
**Nguyên nhân:** Body parser chưa được cấu hình

**Giải pháp:**
```javascript
// app.js
app.use(express.json());
```

### Issue 2: Transaction timeout
**Nguyên nhân:** Query quá chậm hoặc deadlock

**Giải pháp:**
```javascript
await knex.transaction(async (trx) => {
  // ...
}, { timeout: 10000 }); // 10 seconds
```

### Issue 3: UUID collision
**Nguyên nhân:** Rất hiếm, nhưng có thể xảy ra

**Giải pháp:** Code đã xử lý bằng cách generate UUID mới

### Issue 4: Date format error
**Nguyên nhân:** MySQL không chấp nhận `new Date()`

**Giải pháp:** Đã sửa thành `knex.fn.now()`

## Quick Fix Commands

```bash
# 1. Restart server
cd server
npm run dev

# 2. Reset database
npx knex migrate:rollback --all
npx knex migrate:latest
npx knex seed:run

# 3. Test check-in
node test-checkin.js

# 4. Check logs
tail -f server.log  # Nếu có log file
```

## Expected Behavior

### Request
```http
PATCH /api/admin/lich-hen/LH-001/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "soTienCoc": 500000
}
```

### Response (Success)
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

### Database Changes
```sql
-- LichHen
UPDATE LichHen 
SET trangThai = 'cho_kham' 
WHERE idLichHen = 'LH-001';

-- ThanhToan (new)
INSERT INTO ThanhToan (
  idThanhToan, idBenhNhan, idLichHen, 
  soTienCoc, loaiThanhToan, trangThai,
  ngayTao, ngayThanhToan, ghiChu
) VALUES (
  'TT-ABC12345', 'BN-001', 'LH-001',
  500000, 'khi_den_kham', 'da_coc',
  NOW(), NOW(), 'Tiền cọc 500,000đ khi check-in'
);
```

## Contact

Nếu vẫn gặp lỗi, cung cấp:
1. Error message từ server console
2. Request/Response từ Network tab
3. Database state (SELECT queries)
4. Kết quả của `node test-checkin.js`
