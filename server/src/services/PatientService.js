const benhNhanRepo = require("../repositories/PatientRepository");
const userRepo = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");

class PatientService {
  async registerPatient(data) {
    // 1. Kiểm tra CCCD đã tồn tại chưa
    const exist = await benhNhanRepo.findByCCCD(data.cccd);
    if (exist) {
      throw new Error("CCCD đã tồn tại");
    }

    // 2. Kiểm tra email đã được dùng chưa
    const existUser = await userRepo.findByUsername(data.gmail);
    if (existUser) {
      throw new Error("Email đã được sử dụng");
    }

    // 3. Tạo ID tăng dần: BN-001, BN-002, ...
    const count = await benhNhanRepo.countAll();
    const stt = String(count + 1).padStart(3, "0");
    const idBenhNhan = `BN-${stt}`;
    const idUser = `US-BN-${stt}`;

    // 4. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 5. Tính tuổi
    const tuoi = new Date().getFullYear() - new Date(data.ngaySinh).getFullYear();

    // 6. Lưu vào bảng BenhNhan
    const patient = {
      idBenhNhan,
      cccd: data.cccd,
      hoTen: data.hoTen,
      gioiTinh: data.gioiTinh,
      ngaySinh: data.ngaySinh,
      tuoi,
      gmail: data.gmail,
      sdt: data.sdt,
      soBaoHiem: data.soBaoHiem,
      benhNen: data.benhNen,
    };
    await benhNhanRepo.create(patient);

    // 7. Lưu vào bảng users
    const user = {
      idUser,
      role: "benhnhan",
      username: data.gmail,
      password: hashedPassword,
    };
    await userRepo.create(user);

    return { idBenhNhan, idUser, hoTen: data.hoTen };
  }
  async updatePatient(idUser, data) {
    // idUser dạng US-BN-001 → idBenhNhan = BN-001
    const idBenhNhan = idUser.replace("US-", "");
    await benhNhanRepo.update(idBenhNhan, {
      hoTen: data.hoTen,
      cccd: data.cccd,
      gioiTinh: data.gioiTinh,
      ngaySinh: data.ngaySinh,
      gmail: data.gmail,
      sdt: data.sdt,
      soBaoHiem: data.soBaoHiem,
      benhNen: data.benhNen,
    });
  }
  
  async changePassword(idUser, { oldPassword, newPassword }) {
    const user = await userRepo.findById(idUser);
    if (!user) throw new Error("Không tìm thấy tài khoản");
  
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Mật khẩu hiện tại không đúng");
  
    const hashed = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(idUser, hashed);
  }

  async getAllPatients() {
    return await benhNhanRepo.findAll();
  }
  async getProfileByIdUser(idUser) {
    // US-BN-001 → BN-001
    const idBenhNhan = idUser.replace("US-", "");
    const patient = await benhNhanRepo.findById(idBenhNhan);
    if (!patient) throw new Error("Không tìm thấy bệnh nhân");
    return patient;
  }
}

module.exports = new PatientService();