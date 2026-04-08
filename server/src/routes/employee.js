const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getBenhNhan, getBenhNhanById, createBenhNhan, updateBenhNhan,
  getLichHen, createLichHen, getBacSi, checkIn,
} = require('../controllers/employeeController');

router.use(authenticate, authorize('nhanvien', 'admin'));

// ── US-EMP-01: Bệnh nhân ──────────────────────────────────
router.get ('/benh-nhan',     getBenhNhan);      // AC3 — tìm kiếm
router.get ('/benh-nhan/:id', getBenhNhanById);
router.post('/benh-nhan',     createBenhNhan);   // AC1 — thêm mới
router.put ('/benh-nhan/:id', updateBenhNhan);   // AC2 — cập nhật

// ── US-EMP-02: Lịch hẹn ──────────────────────────────────
router.get ('/lich-hen',      getLichHen);        // AC3 — xem danh sách
router.post('/lich-hen',      createLichHen);     // AC1 + AC2 — tạo + kiểm tra trùng
router.put ('/lich-hen/:idLichHen/checkin', checkIn);

// ── Dropdown ─────────────────────────────────────────────
router.get ('/bac-si',        getBacSi);

module.exports = router;