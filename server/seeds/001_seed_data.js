const bcrypt = require('bcryptjs');
const hash = (pw) => bcrypt.hashSync(pw, 10);

exports.seed = async function(knex) {
  // ⚠️ QUAN TRỌNG: Xóa dữ liệu theo thứ tự NGƯỢC với FK constraints
  // FK phụ thuộc → xóa trước
  // Khóa ngoài tham chiếu → xóa sau
  
  // Step 1: Xóa dữ liệu các bảng con (child tables)
  // Những bảng này có FK tham chiếu đến các bảng khác
  await knex('DonThuoc').del();
  await knex('ThanhToan').del();
  await knex('LichSuKham').del();
  await knex('LichHen').del();
  
  // Step 2: Xóa bảng BenhNhan (có FK trong các bảng trên)
  await knex('BenhNhan').del();
  
  // Step 3: Xóa bảng NhanVien
  await knex('NhanVien').del();
  
  // Step 4: Tạm tắt FK check để xóa các bảng có circular dependencies
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
  await knex('BacSi').del();  // Có FK đến Khoa
  await knex('Khoa').del();   // Có FK đến BacSi (idBacSi - trưởng khoa)
  await knex('admin').del();
  await knex('users').del();
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  console.log('✓ Xóa dữ liệu cũ thành công');

  // ── users ─────────────────────────────────────
  await knex('users').insert([
    { idUser: 'USR-ADMIN-001', role: 'admin',    username: 'admin@gmail.com',      password: hash('Admin@123') },
    { idUser: 'USR-NV-001',    role: 'nhanvien', username: 'nhanvien@gmail.com',   password: hash('Nv@123')    },
    // Bác sĩ trưởng khoa
    { idUser: 'USR-BS-001',    role: 'bacsi',    username: 'bs_noi@gmail.com',     password: hash('Bs@123')    },
    { idUser: 'USR-BS-003',    role: 'bacsi',    username: 'bs_ngoai@gmail.com',   password: hash('Bs@123')    },
    { idUser: 'USR-BS-005',    role: 'bacsi',    username: 'bs_nhi@gmail.com',     password: hash('Bs@123')    },
    // Bác sĩ thường
    { idUser: 'USR-BS-002',    role: 'bacsi',    username: 'bs_tieuhoa@gmail.com', password: hash('Bs@123')    },
    { idUser: 'USR-BS-004',    role: 'bacsi',    username: 'bs_san@gmail.com',     password: hash('Bs@123')    },
    { idUser: 'USR-BS-006',    role: 'bacsi',    username: 'bs_dalieu@gmail.com',  password: hash('Bs@123')    },
    { idUser: 'USR-BS-007',    role: 'bacsi',    username: 'bs_mat@gmail.com',     password: hash('Bs@123')    },
    { idUser: 'USR-BS-008',    role: 'bacsi',    username: 'bs_tmh@gmail.com',     password: hash('Bs@123')    },
    // Bệnh nhân
    { idUser: 'USR-BN-001',    role: 'benhnhan', username: 'benhnhan01@gmail.com', password: hash('Bn@123')    },
  ]);

  console.log('✓ Insert users thành công');

  // ── admin ─────────────────────────────────────
  await knex('admin').insert([
    { idAdmin: 'ADM-001', quyenHan: 'full_access', idUser: 'USR-ADMIN-001' },
  ]);

  console.log('✓ Insert admin thành công');

  // ── Khoa (idBacSi để null lúc insert)
  await knex('Khoa').insert([
    { idKhoa: 'dept-1', idBacSi: null, tenKhoa: 'Nội khoa', moTa: 'Khám và điều trị các bệnh nội khoa tổng quát' },
    { idKhoa: 'dept-2', idBacSi: null, tenKhoa: 'Ngoại khoa', moTa: 'Phẫu thuật và can thiệp ngoại khoa' },
    { idKhoa: 'dept-3', idBacSi: null, tenKhoa: 'Sản phụ khoa', moTa: 'Chăm sóc sức khỏe phụ nữ và thai sản' },
    { idKhoa: 'dept-4', idBacSi: null, tenKhoa: 'Nhi khoa', moTa: 'Chăm sóc sức khỏe trẻ em' },
    { idKhoa: 'dept-5', idBacSi: null, tenKhoa: 'Da liễu', moTa: 'Khám và điều trị các bệnh về da' },
    { idKhoa: 'dept-6', idBacSi: null, tenKhoa: 'Mắt', moTa: 'Khám và điều trị các bệnh về mắt' },
    { idKhoa: 'dept-7', idBacSi: null, tenKhoa: 'Tai Mũi Họng', moTa: 'Khám và điều trị tai, mũi, họng' }
  ]);

  console.log('✓ Insert Khoa thành công');

  // ── BacSi ─────────────────────────────────────
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

  console.log('✓ Insert BacSi thành công');

  // ── Cập nhật Khoa.idBacSi (gán trưởng khoa)
  await knex('Khoa').where({ idKhoa: 'dept-1' }).update({ idBacSi: 'BS-001' });
  await knex('Khoa').where({ idKhoa: 'dept-2' }).update({ idBacSi: 'BS-003' });
  await knex('Khoa').where({ idKhoa: 'dept-4' }).update({ idBacSi: 'BS-005' });

  console.log('✓ Update Khoa.idBacSi thành công');

  // ── NhanVien ───────────────────────────────────
  await knex('NhanVien').insert([
    { idNhanVien: 'NV-001', hoTen: 'Phạm Thị Dung', idUser: 'USR-NV-001' },
  ]);

  console.log('✓ Insert NhanVien thành công');

  // ── BenhNhan ───────────────────────────────────
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

  console.log('✓ Insert BenhNhan thành công');

  // ── LichHen ────────────────────────────────────
  await knex('LichHen').insert([
    {
      idLichHen:   'LH-001',
      ngayHen:     '2026-04-22',
      gioHen:      '09:00:00',
      trangThai:   'Đã xác nhận',
      idBenhNhan:  'BN-001',
      idBacSi:     'BS-001',
      idNhanVien:  'NV-001',
    },
  ]);

  console.log('✓ Insert LichHen thành công');

  // ── LichSuKham ─────────────────────────────────
  await knex('LichSuKham').insert([
    {
      idLichSu:           'LSK-001',
      ngayKham:           '2026-03-10',
      chanDoan:           'Hở van tim nhẹ độ 1',
      huongDieuTri:       'Uống thuốc theo đơn, tái khám sau 1 tháng',
      idBenhNhan:         'BN-001',
      idBacSi:            'BS-001',
      trangThai:          'APPROVED',
      approvedByDoctorId: 'BS-001',
    },
  ]);

  console.log('✓ Insert LichSuKham thành công');

  // ── DonThuoc ───────────────────────────────────
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

  console.log('✓ Insert DonThuoc thành công');

  console.log('\n✅ ═════════════════════════════════════════');
  console.log('✅ Seed dữ liệu cơ bản hoàn tất!');
  console.log('✅ ═════════════════════════════════════════\n');
};