const userRepo = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  async login(username, password) {
    // 1. Tìm user theo email
    const user = await userRepo.findByUsername(username);
    if (!user) {
      throw new Error("Email không tồn tại");
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu không đúng");
    }

    // 3. Tạo JWT token
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
      }
    };
  }
}

module.exports = new AuthService();