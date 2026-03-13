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
    { idUser: 'USR-ADMIN-001', role: 'admin',       username: 'admin',      password: hash('Admin@123') },
    { idUser: 'USR-NV-001',    role: 'nhanvien',    username: 'nhanvien',   password: hash('Nv@123')    },
    { idUser: 'USR-BS-001',    role: 'bacsi',       username: 'bs_tim',     password: hash('Bs@123')    },
    { idUser: 'USR-BS-002',    role: 'bacsi',       username: 'bs_xuong',   password: hash('Bs@123')    },
    { idUser: 'USR-BN-001',    role: 'benhnhan',    username: 'benhnhan01', password: hash('Bn@123')    },
  ]);

  // ── admin ─────────────────────────────────────
  await knex('admin').insert([
    { idAdmin: 'ADM-001', quyenHan: 'full_access', idUser: 'USR-ADMIN-001' },
  ]);

  // ── Khoa (idBacSi = null trước, cập nhật sau) ─
  await knex('Khoa').insert([
    { idKhoa: 'KHOA-TIM',   idBacSi: null, tenKhoa: 'Khoa Tim mạch',   moTa: 'Chuyên khám và điều trị bệnh tim mạch'    },
    { idKhoa: 'KHOA-XUONG', idBacSi: null, tenKhoa: 'Khoa Xương khớp', moTa: 'Chuyên khám và điều trị bệnh xương khớp'  },
    { idKhoa: 'KHOA-TK',    idBacSi: null, tenKhoa: 'Khoa Thần kinh',  moTa: 'Chuyên khám và điều trị bệnh thần kinh'   },
  ]);

  // ── BacSiTruong ───────────────────────────────
  await knex('BacSiTruong').insert([
    { idBacSiTruong: 'BST-001', hoTen: 'PGS.TS Nguyễn Văn An', phuCap: 5000000 },
  ]);

  // ── BacSi ─────────────────────────────────────
  await knex('BacSi').insert([
    { idBacSi: 'BS-001', idKhoa: 'KHOA-TIM',   hoTen: 'BS. Trần Thị Bình', chuyenKhoa: 'Tim mạch',   namKinhNghiem: 8 },
    { idBacSi: 'BS-002', idKhoa: 'KHOA-XUONG', hoTen: 'BS. Lê Văn Cường',  chuyenKhoa: 'Xương khớp', namKinhNghiem: 5 },
  ]);

  // ── Cập nhật Khoa.idBacSi (bác sĩ trưởng khoa)
  await knex('Khoa').where({ idKhoa: 'KHOA-TIM' }).update({ idBacSi: 'BS-001' });

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
      ngayHen:     '2026-03-20',
      gioHen:      '09:00:00',
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