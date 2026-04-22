const userRepo = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const knex = require("../db");
const { v4: uuidv4 } = require("uuid");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 30;

class AuthService {
  /**
   * Tạo refresh token, lưu vào DB
   */
  async _createRefreshToken(idUser) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await knex("RefreshTokens").insert({
      idUser,
      token,
      expiresAt,
    });

    return token;
  }

  /**
   * Đăng nhập — trả access token + refresh token
   */
  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if (!user) throw new Error("Email không tồn tại");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Mật khẩu không đúng");

    let hoTen = user.username;
    let idBenhNhan = null;
    let idBacSi = null;
    let isTruongKhoa = false;
    let idKhoa = null;

    try {
      const currentRole = user.role ? user.role.toUpperCase() : '';
      if (currentRole === 'BENHNHAN') {
        const patient = await knex('BenhNhan').where({ gmail: user.username }).first();
        if (patient) {
          hoTen = patient.hoTen;
          idBenhNhan = patient.idBenhNhan;
        }
      } else if (currentRole === 'BACSI') {
        const bacSi = await knex('BacSi').where({ idUser: user.idUser }).first();
        if (bacSi) {
          hoTen = bacSi.hoTen;
          idBacSi = bacSi.idBacSi;
          isTruongKhoa = !!bacSi.isTruongKhoa;
          idKhoa = bacSi.idKhoa;
        }
      }
    } catch (error) {
      console.error("AuthService login error:", error.message);
    }

    const accessToken = jwt.sign(
      { idUser: user.idUser, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = await this._createRefreshToken(user.idUser);

    return {
      token: accessToken,
      refreshToken,
      user: {
        idUser: user.idUser,
        role: user.role,
        username: user.username,
        hoTen,
        ...(idBenhNhan && { idBenhNhan }),
        ...(idBacSi && { idBacSi, isTruongKhoa, idKhoa }),
      }
    };
  }

  /**
   * Dùng refresh token để lấy access token mới (rotation)
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("Refresh token không được cung cấp");

    const stored = await knex("RefreshTokens").where({ token: refreshToken }).first();
    if (!stored) throw new Error("Refresh token không hợp lệ");

    // Kiểm tra hết hạn
    if (new Date(stored.expiresAt) < new Date()) {
      await knex("RefreshTokens").where({ id: stored.id }).del();
      throw new Error("Refresh token đã hết hạn");
    }

    // Lấy user
    const user = await userRepo.findById(stored.idUser);
    if (!user) {
      await knex("RefreshTokens").where({ id: stored.id }).del();
      throw new Error("Người dùng không tồn tại");
    }

    // Xóa refresh token cũ (rotation)
    await knex("RefreshTokens").where({ id: stored.id }).del();

    // Tạo access token mới
    const newAccessToken = jwt.sign(
      { idUser: user.idUser, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Tạo refresh token mới
    const newRefreshToken = await this._createRefreshToken(user.idUser);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Đăng xuất — xóa refresh token khỏi DB
   */
  async logout(refreshToken) {
    if (refreshToken) {
      await knex("RefreshTokens").where({ token: refreshToken }).del();
    }
  }
}

module.exports = new AuthService();