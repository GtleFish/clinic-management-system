const express = require("express");
const router = express.Router();
// const { authenticate, authorize } = require("../middleware/auth");
const {
  datLichKham,
  getPatientHistory,
  getSoLuongDatTrongNgay,
  getLichSuKham,
  getDonThuoc,
} = require("../controllers/patientController");

// router.use(authenticate, authorize("benhnhan", "admin"));

router.post("/booking", datLichKham);
router.get("/history", getPatientHistory);
router.get("/booking/counts", getSoLuongDatTrongNgay);
router.get("/lich-su-kham", getLichSuKham);
router.get("/don-thuoc/:idLichSu", getDonThuoc);

module.exports = router;
