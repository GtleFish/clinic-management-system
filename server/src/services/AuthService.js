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
    let idBenhNhan = null;

    try {
      const currentRole = user.role ? user.role.toUpperCase() : '';
      if (currentRole === 'BENHNHAN') {
        const patient = await knex('BenhNhan').where({ gmail: user.username }).first();
        if (patient) {
          hoTen = patient.hoTen;
          idBenhNhan = patient.idBenhNhan;
        }
      }
    } catch (error) {
      console.error("AuthService login error:", error.message);
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
        hoTen,
        ...(idBenhNhan && { idBenhNhan }),
      }
    };
  }
}

module.exports = new AuthService();