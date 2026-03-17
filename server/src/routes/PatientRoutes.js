const express = require("express");
const router = express.Router();
const patientService = require("../services/PatientService");
const jwt = require("jsonwebtoken");
//Đăng ký bệnh nhân mới
router.post("/register", async (req, res) => {
  try {
    const data = await patientService.registerPatient(req.body);
    res.status(201).json({
      message: "Đăng ký thành công",
      data: data
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});
// Cập nhật hồ sơ
router.put("/update/:idUser", async (req, res) => {
  try {
    await patientService.updatePatient(req.params.idUser, req.body);
    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Middleware xác thực token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// GET profile theo token
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const data = await patientService.getProfileByIdUser(req.user.idUser);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Đổi mật khẩu
router.put("/change-password/:idUser", async (req, res) => {
  try {
    await patientService.changePassword(req.params.idUser, req.body);
    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;