const express = require("express");
const router = express.Router();
// const { authenticate, authorize } = require("../middleware/auth");
const {
  getDanhSachChoKham,
  luuKetQuaKham,
  getBenhNhanDetail,
  getKhoaList,
  getBacSiTruongList,
} = require("../controllers/doctorController");

// router.use(authenticate, authorize("bacsi", "admin"));

router.get("/danh-sach-cho", getDanhSachChoKham);
router.post("/ket-qua-kham", luuKetQuaKham);
router.get("/benh-nhan/:idBenhNhan", getBenhNhanDetail);
router.get("/khoa", getKhoaList);
router.get("/bac-si-truong", getBacSiTruongList);

module.exports = router;
