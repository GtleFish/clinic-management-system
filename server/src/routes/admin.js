const express = require('express');
const router  = express.Router();

const { authenticate, authorize }             = require('../middleware/auth');
const { validateCreateDoctor, validateUpdateDoctor } = require('../middleware/validate');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getKhoa,
  getLichHenHomNay,
  checkInLichHen,
  huyLichHen,
  doiLichXuongCuoi,
  getTatCaLichHen,
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

// ── Bác sĩ ─────────────────────────────────────────────────
// GET    /api/admin/doctors          → danh sách bác sĩ
// POST   /api/admin/doctors          → tạo mới bác sĩ (AC1)
// GET    /api/admin/doctors/:idBacSi → chi tiết bác sĩ
// PUT    /api/admin/doctors/:idBacSi → cập nhật bác sĩ
// DELETE /api/admin/doctors/:idBacSi → xóa bác sĩ

router.get   ('/doctors',          getDoctors);
router.post  ('/doctors',          validateCreateDoctor, createDoctor);
router.get   ('/doctors/:idBacSi', getDoctorById);
router.put   ('/doctors/:idBacSi', validateUpdateDoctor, updateDoctor);
router.delete('/doctors/:idBacSi', deleteDoctor);
router.get  ('/lich-hen/all',              getTatCaLichHen);
router.patch('/lich-hen/:idLichHen/checkin',   checkInLichHen);
router.patch('/lich-hen/:idLichHen/huy',       huyLichHen);
router.patch('/lich-hen/:idLichHen/doi-cuoi',  doiLichXuongCuoi);
// ── Khoa (dropdown) ────────────────────────────────────────
// GET /api/admin/khoa
router.get('/khoa', getKhoa);

module.exports = router;