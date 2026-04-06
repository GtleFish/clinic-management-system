const express = require("express");
const router = express.Router();
// const { authenticate, authorize } = require("../middleware/auth");
const { getLichSuKham, getDonThuoc } = require("../controllers/patientController");

// router.use(authenticate, authorize("benhnhan", "admin"));

router.get("/lich-su-kham", getLichSuKham);
router.get("/don-thuoc/:idLichSu", getDonThuoc);

module.exports = router;
