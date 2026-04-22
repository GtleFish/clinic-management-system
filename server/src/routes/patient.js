const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
  datLichKham,
  getPatientHistory,
  getSoLuongDatTrongNgay,
  getLichSuKham,
  getDonThuoc,
  getDanhSachKhoa,
  getDanhSachBacSi,
} = require("../controllers/patientController");

/** Public — không cần đăng nhập */
router.get("/khoa", getDanhSachKhoa);
router.get("/bacsi", getDanhSachBacSi);
router.post("/booking", datLichKham);
router.get("/booking/counts", getSoLuongDatTrongNgay);

router.use(authenticate, authorize("benhnhan", "admin"));

router.get("/history", getPatientHistory);
router.get("/lich-su-kham", getLichSuKham);
router.get("/don-thuoc/:idLichSu", getDonThuoc);

module.exports = router;