const userRepo = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const knex = require("../db"); 

class AuthService {
  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if (!user) throw new Error("Email không tồn tại");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Mật khẩu không đúng");

    let hoTen = user.username; 

    // ==== PHẦN NÀY ĐỂ IN RA TERMINAL TÌM LỖI ====
    console.log("=== BẮT ĐẦU KIỂM TRA ĐĂNG NHẬP ===");
    console.log("1. Tài khoản đang đăng nhập:", user.username);
    console.log("2. Role (vai trò) trong bảng users là:", user.role);
    // ============================================

    try {
      // Đưa role về viết hoa hết để tránh lỗi gõ chữ hoa chữ thường
      const currentRole = user.role ? user.role.toUpperCase() : '';

      // Thêm chữ 'USER' vào đây phòng trường hợp bạn lưu role là 'user'
      if (currentRole === 'PATIENT' || currentRole === 'BENHNHAN' || currentRole === 'USER') {
        console.log("3. Role hợp lệ, đang tiến hành tìm trong bảng BenhNhan...");
        
        // Tìm bệnh nhân theo gmail
        const patient = await knex('BenhNhan').where({ gmail: user.username }).first();
        
        if (patient) {
          console.log("4. THÀNH CÔNG! Đã tìm thấy tên:", patient.hoTen);
          hoTen = patient.hoTen;
        } else {
          console.log("4. THẤT BẠI! Không tìm thấy ai có gmail này trong bảng BenhNhan!");
        }
      } else {
        console.log("3. BỎ QUA! Chữ Role không khớp điều kiện (không phải PATIENT/BENHNHAN/USER)");
      }
    } catch (error) {
      console.error("LỖI SQL HOẶC DATABASE:", error.message);
    }
    const token = jwt.sign(
      { idUser: user.idUser, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        idUser: user.idUser,
        role: user.role,
        username: user.username,
        hoTen: hoTen 
      }
    };
  }
}

module.exports = new AuthService();