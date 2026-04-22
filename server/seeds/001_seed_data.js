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
  await knex('Khoa').del();
  await knex('admin').del();
  await knex('users').del();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // ── users ─────────────────────────────────────
  await knex('users').insert([
    { idUser: 'USR-ADMIN-001', role: 'admin',    username: 'admin@gmail.com',      password: hash('Admin@123') },
    { idUser: 'USR-NV-001',    role: 'nhanvien', username: 'nhanvien@gmail.com',   password: hash('Nv@123')    },
    // Bác sĩ trưởng khoa
    { idUser: 'USR-BS-001',    role: 'bacsi',    username: 'bs_noi@gmail.com',     password: hash('Bs@123')    }, // BS-001 Nguyễn Văn An — Trưởng Nội khoa
    { idUser: 'USR-BS-003',    role: 'bacsi',    username: 'bs_ngoai@gmail.com',   password: hash('Bs@123')    }, // BS-003 Lê Minh Cường — Trưởng Ngoại khoa
    { idUser: 'USR-BS-005',    role: 'bacsi',    username: 'bs_nhi@gmail.com',     password: hash('Bs@123')    }, // BS-005 Hoàng Văn Em — Trưởng Nhi khoa
    // Bác sĩ thường
    { idUser: 'USR-BS-002',    role: 'bacsi',    username: 'bs_tieuhoa@gmail.com', password: hash('Bs@123')    }, // BS-002 Trần Thị Bình
    { idUser: 'USR-BS-004',    role: 'bacsi',    username: 'bs_san@gmail.com',     password: hash('Bs@123')    }, // BS-004 Phạm Thu Dung
    { idUser: 'USR-BS-006',    role: 'bacsi',    username: 'bs_dalieu@gmail.com',  password: hash('Bs@123')    }, // BS-006 Vũ Thị Fương
    { idUser: 'USR-BS-007',    role: 'bacsi',    username: 'bs_mat@gmail.com',     password: hash('Bs@123')    }, // BS-007 Đỗ Quang Giang
    { idUser: 'USR-BS-008',    role: 'bacsi',    username: 'bs_tmh@gmail.com',     password: hash('Bs@123')    }, // BS-008 Ngô Thanh Hà
    // Bệnh nhân
    { idUser: 'USR-BN-001',    role: 'benhnhan', username: 'benhnhan01@gmail.com', password: hash('Bn@123')    },
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

  // ── BacSi (Dữ liệu 8 Bác sĩ chuẩn cho Frontend) ─────────────────────────────────────
  // BS-001, BS-003, BS-005 là trưởng khoa
  await knex('BacSi').insert([
    { idBacSi: 'BS-001', idKhoa: 'dept-1', hoTen: 'Nguyễn Văn An',    chuyenKhoa: 'Tim mạch',              namKinhNghiem: 15, isTruongKhoa: true,  phuCap: 5000000, idUser: 'USR-BS-001' },
    { idBacSi: 'BS-002', idKhoa: 'dept-1', hoTen: 'Trần Thị Bình',    chuyenKhoa: 'Tiêu hóa',              namKinhNghiem: 10, isTruongKhoa: false, phuCap: 0,       idUser: 'USR-BS-002' },
    { idBacSi: 'BS-003', idKhoa: 'dept-2', hoTen: 'Lê Minh Cường',    chuyenKhoa: 'Phẫu thuật tổng quát', namKinhNghiem: 20, isTruongKhoa: true,  phuCap: 6000000, idUser: 'USR-BS-003' },
    { idBacSi: 'BS-004', idKhoa: 'dept-3', hoTen: 'Phạm Thu Dung',    chuyenKhoa: 'Sản khoa',              namKinhNghiem: 12, isTruongKhoa: false, phuCap: 0,       idUser: 'USR-BS-004' },
    { idBacSi: 'BS-005', idKhoa: 'dept-4', hoTen: 'Hoàng Văn Em',     chuyenKhoa: 'Nhi tổng quát',         namKinhNghiem: 18, isTruongKhoa: true,  phuCap: 5500000, idUser: 'USR-BS-005' },
    { idBacSi: 'BS-006', idKhoa: 'dept-5', hoTen: 'Vũ Thị Fương',     chuyenKhoa: 'Da liễu thẩm mỹ',      namKinhNghiem: 8,  isTruongKhoa: false, phuCap: 0,       idUser: 'USR-BS-006' },
    { idBacSi: 'BS-007', idKhoa: 'dept-6', hoTen: 'Đỗ Quang Giang',   chuyenKhoa: 'Phẫu thuật mắt',       namKinhNghiem: 14, isTruongKhoa: false, phuCap: 0,       idUser: 'USR-BS-007' },
    { idBacSi: 'BS-008', idKhoa: 'dept-7', hoTen: 'Ngô Thanh Hà',     chuyenKhoa: 'Tai mũi họng',          namKinhNghiem: 9,  isTruongKhoa: false, phuCap: 0,       idUser: 'USR-BS-008' },
  ]);

  // ── Cập nhật Khoa.idBacSi (trưởng khoa)
  await knex('Khoa').where({ idKhoa: 'dept-1' }).update({ idBacSi: 'BS-001' }); // Nội khoa
  await knex('Khoa').where({ idKhoa: 'dept-2' }).update({ idBacSi: 'BS-003' }); // Ngoại khoa
  await knex('Khoa').where({ idKhoa: 'dept-4' }).update({ idBacSi: 'BS-005' }); // Nhi khoa

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
      idBacSi:        'BS-001', // Bác sĩ trưởng khoa Nội khoa
      trangThai:      'APPROVED',
      approvedByDoctorId: 'BS-001',
    },
  ]);

  // ── DonThuoc ──────────────────────────────────
  await knex('DonThuoc').insert([
    {
      idDonThuoc:          'DT-001',
      tenThuoc:            'Aspirin 100mg',
      soLuong:             30,
      lieuLuong:           '1 viên/ngày sau ăn sáng',
      ngayKeDon:           '2026-03-10',
      approvedByDoctorId:  'BS-001',
      idLichSu:            'LSK-001',
    },
    {
      idDonThuoc:          'DT-002',
      tenThuoc:            'Amlodipine 5mg',
      soLuong:             30,
      lieuLuong:           '1 viên/ngày buổi tối',
      ngayKeDon:           '2026-03-10',
      approvedByDoctorId:  'BS-001',
      idLichSu:            'LSK-001',
    },
  ]);

  console.log('✅ Seed data hoàn tất!');
};