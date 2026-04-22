const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
  getDanhSachChoKham,
  luuKetQuaKham,
  getBenhNhanDetail,
  getKhoaList,
  getBacSiTruongList,
  getLichHenCuaToi,
  getKetQuaChoDuyet,
  getKetQuaKhamCuaBenhNhan,
} = require("../controllers/doctorController");

router.use(authenticate, authorize("bacsi", "admin"));

router.get("/danh-sach-cho", getDanhSachChoKham);
router.get("/lich-hen-cua-toi", getLichHenCuaToi);
router.get("/ket-qua-cho-duyet", getKetQuaChoDuyet);
router.post("/ket-qua-kham", luuKetQuaKham);
router.get("/ket-qua-kham/:idBenhNhan", getKetQuaKhamCuaBenhNhan);
router.get("/benh-nhan/:idBenhNhan", getBenhNhanDetail);
router.get("/khoa", getKhoaList);
router.get("/bac-si-truong", getBacSiTruongList);

module.exports = router;