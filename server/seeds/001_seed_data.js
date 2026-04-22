const bcrypt = require('bcryptjs');
const hash = (pw) => bcrypt.hashSync(pw, 10);

exports.seed = async function(knex) {
  // Xóa theo thứ tự ngược FK
  await knex('DonThuoc').del();
  await knex('LichSuKham').del();
  await knex('LichHen').del();
  await knex('BenhNhan').del();
  await knex('NhanVien').del();
  
  // Bỏ FK Khoa.idBacSi tạm để xóa được
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('BacSi').del();
  await knex('BacSiTruong').del();
  await knex('Khoa').del();
  await knex('admin').del();
  await knex('users').del();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // ── users ─────────────────────────────────────
  await knex('users').insert([
    { idUser: 'USR-ADMIN-001', role: 'admin',       username: 'admin@gmail.com',      password: hash('Admin@123') },
    { idUser: 'USR-NV-001',    role: 'nhanvien',    username: 'nhanvien@gmail.com',   password: hash('Nv@123')    },
    { idUser: 'USR-BS-001',    role: 'bacsi',       username: 'bs_tim@gmail.com',     password: hash('Bs@123')    },
    { idUser: 'USR-BS-002',    role: 'bacsi',       username: 'bs_xuong@gmail.com',   password: hash('Bs@123')    },
    { idUser: 'USR-BN-001',    role: 'benhnhan',    username: 'benhnhan01@gmail.com', password: hash('Bn@123')    },
  ]);

  // ── admin ─────────────────────────────────────
  await knex('admin').insert([
    { idAdmin: 'ADM-001', quyenHan: 'full_access', idUser: 'USR-ADMIN-001' },
  ]);

  // ── Khoa (Dữ liệu 7 Khoa chuẩn cho Frontend) ─
  await knex('Khoa').insert([
    { idKhoa: 'dept-1', idBacSi: null, tenKhoa: 'Nội khoa', moTa: 'Khám và điều trị các bệnh nội khoa tổng quát' },
    { idKhoa: 'dept-2', idBacSi: null, tenKhoa: 'Ngoại khoa', moTa: 'Phẫu thuật và can thiệp ngoại khoa' },
    { idKhoa: 'dept-3', idBacSi: null, tenKhoa: 'Sản phụ khoa', moTa: 'Chăm sóc sức khỏe phụ nữ và thai sản' },
    { idKhoa: 'dept-4', idBacSi: null, tenKhoa: 'Nhi khoa', moTa: 'Chăm sóc sức khỏe trẻ em' },
    { idKhoa: 'dept-5', idBacSi: null, tenKhoa: 'Da liễu', moTa: 'Khám và điều trị các bệnh về da' },
    { idKhoa: 'dept-6', idBacSi: null, tenKhoa: 'Mắt', moTa: 'Khám và điều trị các bệnh về mắt' },
    { idKhoa: 'dept-7', idBacSi: null, tenKhoa: 'Tai Mũi Họng', moTa: 'Khám và điều trị tai, mũi, họng' }
  ]);

  // ── BacSiTruong ───────────────────────────────
  await knex('BacSiTruong').insert([
    { idBacSiTruong: 'BST-001', hoTen: 'PGS.TS Nguyễn Văn An', phuCap: 5000000 },
  ]);

  // ── BacSi (Dữ liệu 8 Bác sĩ chuẩn cho Frontend) ─────────────────────────────────────
  await knex('BacSi').insert([
    { idBacSi: 'BS-001', idKhoa: 'dept-1', hoTen: 'BS. Nguyễn Văn An', chuyenKhoa: 'Tim mạch', namKinhNghiem: 15 },
    { idBacSi: 'BS-002', idKhoa: 'dept-1', hoTen: 'BS. Trần Thị Bình', chuyenKhoa: 'Tiêu hóa', namKinhNghiem: 10 },
    { idBacSi: 'BS-003', idKhoa: 'dept-2', hoTen: 'BS. Lê Minh Cường', chuyenKhoa: 'Phẫu thuật tổng quát', namKinhNghiem: 20 },
    { idBacSi: 'BS-004', idKhoa: 'dept-3', hoTen: 'BS. Phạm Thu Dung', chuyenKhoa: 'Sản khoa', namKinhNghiem: 12 },
    { idBacSi: 'BS-005', idKhoa: 'dept-4', hoTen: 'BS. Hoàng Văn Em', chuyenKhoa: 'Nhi tổng quát', namKinhNghiem: 18 },
    { idBacSi: 'BS-006', idKhoa: 'dept-5', hoTen: 'BS. Vũ Thị Fương', chuyenKhoa: 'Da liễu thẩm mỹ', namKinhNghiem: 8 },
    { idBacSi: 'BS-007', idKhoa: 'dept-6', hoTen: 'BS. Đỗ Quang Giang', chuyenKhoa: 'Phẫu thuật mắt', namKinhNghiem: 14 },
    { idBacSi: 'BS-008', idKhoa: 'dept-7', hoTen: 'BS. Ngô Thanh Hà', chuyenKhoa: 'Tai mũi họng', namKinhNghiem: 9 }
  ]);

  // ── Cập nhật Khoa.idBacSi (Cho BS-001 làm trưởng Nội khoa)
  await knex('Khoa').where({ idKhoa: 'dept-1' }).update({ idBacSi: 'BS-001' });

  // ── NhanVien ──────────────────────────────────
  await knex('NhanVien').insert([
    { idNhanVien: 'NV-001', hoTen: 'Phạm Thị Dung', idUser: 'USR-NV-001' },
  ]);

  // ── BenhNhan ──────────────────────────────────
  await knex('BenhNhan').insert([
    {
      idBenhNhan:  'BN-001',
      cccd:        '012345678901',
      hoTen:       'Nguyễn Văn Em',
      gioiTinh:    'Nam',
      ngaySinh:    '1990-05-15',
      tuoi:        35,
      gmail:       'benhnhan01@gmail.com',
      sdt:         '0901234567',
      soBaoHiem:   'BH123456789',
      benhNen:     'Tiểu đường type 2',
    },
  ]);

 // ── LichHen ───────────────────────────────────
  await knex('LichHen').insert([
    {
      idLichHen:   'LH-001',
      ngayHen:     '2026-04-22', // Ngày hôm nay
      gioHen:      '00:30:00',   // Giờ hẹn lúc 00:30 sáng (để lúc 1:07 là đã trễ > 30p)
      trangThai:   'Đã xác nhận',
      idBenhNhan:  'BN-001',
      idBacSi:     'BS-001',
      idNhanVien:  'NV-001',
    },
  ]);

  // ── LichSuKham ────────────────────────────────
  await knex('LichSuKham').insert([
    {
      idLichSu:       'LSK-001',
      ngayKham:       '2026-03-10',
      chanDoan:       'Hở van tim nhẹ độ 1',
      huongDieuTri:   'Uống thuốc theo đơn, tái khám sau 1 tháng',
      idBenhNhan:     'BN-001',
      idBacSiTruong:  'BST-001',
    },
  ]);

  // ── DonThuoc ──────────────────────────────────
  await knex('DonThuoc').insert([
    {
      idDonThuoc:    'DT-001',
      tenThuoc:      'Aspirin 100mg',
      soLuong:       30,
      lieuLuong:     '1 viên/ngày sau ăn sáng',
      ngayKeDon:     '2026-03-10',
      idBacSiTruong: 'BST-001',
      idLichSu:      'LSK-001',
    },
    {
      idDonThuoc:    'DT-002',
      tenThuoc:      'Amlodipine 5mg',
      soLuong:       30,
      lieuLuong:     '1 viên/ngày buổi tối',
      ngayKeDon:     '2026-03-10',
      idBacSiTruong: 'BST-001',
      idLichSu:      'LSK-001',
    },
  ]);

  console.log('✅ Seed data hoàn tất!');
};