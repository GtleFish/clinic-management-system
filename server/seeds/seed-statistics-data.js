const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  console.log('\n🌱 ═════════════════════════════════════════');
  console.log('🌱 Bắt đầu seed dữ liệu thống kê...');
  console.log('🌱 ═════════════════════════════════════════\n');

  try {
    // 1. Lấy dữ liệu cơ bản từ database
    console.log('  📥 Đang lấy dữ liệu bác sĩ, bệnh nhân, khoa...');
    
    const doctors = await knex('BacSi').select('idBacSi', 'hoTen', 'idKhoa');
    const patients = await knex('BenhNhan').select('idBenhNhan', 'hoTen').orderBy('idBenhNhan');
    const departments = await knex('Khoa').select('idKhoa', 'tenKhoa');
    const headDoctors = await knex('BacSi')
      .select('idBacSi', 'hoTen')
      .where('isTruongKhoa', true);

    // Kiểm tra dữ liệu đầu vào
    if (doctors.length === 0) {
      console.error('  ✗ Không tìm thấy bác sĩ trong database!');
      return;
    }
    if (patients.length === 0) {
      console.error('  ✗ Không tìm thấy bệnh nhân trong database!');
      return;
    }
    if (departments.length === 0) {
      console.error('  ✗ Không tìm thấy khoa trong database!');
      return;
    }

    console.log(`  ✓ Tìm thấy ${doctors.length} bác sĩ`);
    console.log(`  ✓ Tìm thấy ${patients.length} bệnh nhân`);
    console.log(`  ✓ Tìm thấy ${departments.length} khoa`);
    console.log(`  ✓ Tìm thấy ${headDoctors.length} trưởng khoa`);

    // 2. Xóa dữ liệu cũ (theo thứ tự FK)
    console.log('\n  🗑️  Xóa dữ liệu cũ...');
    const deletedDonThuoc = await knex('DonThuoc').del();
    const deletedThanhToan = await knex('ThanhToan').del();
    const deletedLichSuKham = await knex('LichSuKham').del();
    const deletedLichHen = await knex('LichHen').del();

    console.log(`  ✓ Xóa ${deletedDonThuoc} đơn thuốc`);
    console.log(`  ✓ Xóa ${deletedThanhToan} thanh toán`);
    console.log(`  ✓ Xóa ${deletedLichSuKham} lịch sử khám`);
    console.log(`  ✓ Xóa ${deletedLichHen} lịch hẹn`);

    // 3. Tạo dữ liệu LichHen (Lịch hẹn) - 90 ngày gần đây
    console.log('\n  📅 Tạo lịch hẹn...');
    const appointments = [];
    const today = new Date();
    const timeSlots = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00'];
    
    // Tạo 40 lịch hẹn phân bổ trong 90 ngày qua
    for (let i = 0; i < 40; i++) {
      const appointmentDate = new Date(today);
      const daysAgo = Math.floor(Math.random() * 90); // 0-90 ngày trước
      appointmentDate.setDate(today.getDate() - daysAgo);

      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      // 70% đã khám, 20% đang chờ, 10% hủy
      const rand = Math.random();
      let trangThai;
      if (rand < 0.7) trangThai = 'da_kham';
      else if (rand < 0.9) trangThai = 'dang_cho';
      else trangThai = 'huy';

      appointments.push({
        idLichHen: `LH-${uuidv4().slice(0, 8).toUpperCase()}`,
        idBacSi: doctor.idBacSi,
        idBenhNhan: patient.idBenhNhan,
        ngayHen: appointmentDate.toISOString().split('T')[0],
        gioHen: timeSlot,
        trangThai: trangThai,
      });
    }

    await knex('LichHen').insert(appointments);
    console.log(`  ✓ Tạo ${appointments.length} lịch hẹn`);

    // 4. Tạo dữ liệu LichSuKham (Lịch sử khám bệnh) - Chỉ cho lịch hẹn đã khám
    console.log('\n  🏥 Tạo lịch sử khám bệnh...');
    const diagnoses = [
      'Cảm cúm thông thường',
      'Viêm họng cấp',
      'Cao huyết áp',
      'Tiểu đường type 2',
      'Đau lưng mạn tính',
      'Viêm xoang',
      'Dị ứng da',
      'Đau đầu migraine',
      'Viêm dạ dày',
    ];

    const treatments = [
      'Uống thuốc theo đơn, nghỉ ngơi',
      'Tiêm kháng sinh, uống thuốc',
      'Thay đổi chế độ ăn, tập thể dục',
      'Uống thuốc hạ đường huyết, kiểm soát ăn uống',
      'Vật lý trị liệu, massage',
      'Rửa mũi, xịt mũi, uống thuốc',
      'Uống thuốc kháng dị ứng, tránh tiếp xúc',
      'Uống thuốc giảm đau, nghỉ ngơi',
      'Uống thuốc bảo vệ dạ dày, ăn uống điều độ',
    ];

    const exams = [];
    const completedAppointments = appointments.filter(a => a.trangThai === 'da_kham');

    for (const appt of completedAppointments) {
      // Sử dụng bác sĩ từ lịch hẹn
      const approver = headDoctors.length > 0 
        ? headDoctors[Math.floor(Math.random() * headDoctors.length)]
        : null;
      
      const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
      const treatment = treatments[Math.floor(Math.random() * treatments.length)];

      exams.push({
        idLichSu: `LSK-${uuidv4().slice(0, 8).toUpperCase()}`,
        idBacSi: appt.idBacSi, // Bác sĩ từ lịch hẹn
        idBenhNhan: appt.idBenhNhan,
        ngayKham: appt.ngayHen,
        chanDoan: diagnosis,
        huongDieuTri: treatment,
        trangThai: approver ? 'APPROVED' : 'PENDING',
        approvedByDoctorId: approver ? approver.idBacSi : null,
      });
    }

    if (exams.length > 0) {
      await knex('LichSuKham').insert(exams);
      console.log(`  ✓ Tạo ${exams.length} lịch sử khám bệnh`);
    } else {
      console.log(`  ⊘ Không có lịch hẹn đã khám để tạo lịch sử`);
    }

    // 5. Tạo dữ liệu ThanhToan (Thanh toán) - Cho lịch hẹn không bị hủy
    console.log('\n  💰 Tạo dữ liệu thanh toán...');
    const payments = [];
    const validAppointments = appointments.filter(a => a.trangThai !== 'huy');

    for (const appt of validAppointments) {
      const paymentType = Math.random() > 0.5 ? 'khi_dat_lich' : 'khi_den_kham';
      const amount = 200000 + Math.floor(Math.random() * 300000); // 200k-500k
      
      // Tạo ngày thanh toán gần với ngày hẹn
      const paymentDate = new Date(appt.ngayHen);
      if (paymentType === 'khi_dat_lich') {
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 3)); // 0-3 ngày trước
      }

      payments.push({
        idThanhToan: `TT-${uuidv4().slice(0, 8).toUpperCase()}`,
        idBenhNhan: appt.idBenhNhan,
        idLichHen: appt.idLichHen,
        soTienCoc: amount,
        loaiThanhToan: paymentType,
        trangThai: appt.trangThai === 'da_kham' ? 'thanh_toan_du' : 'da_coc',
        ngayTao: paymentDate,
        ngayThanhToan: paymentDate,
        ghiChu: 'Tiền cọc khám bệnh',
      });
    }

    await knex('ThanhToan').insert(payments);
    console.log(`  ✓ Tạo ${payments.length} bản ghi thanh toán`);

    // 6. Tạo dữ liệu DonThuoc (Đơn thuốc)
    console.log('\n  💊 Tạo dữ liệu đơn thuốc...');
    const medicines = [
      { name: 'Aspirin 100mg', quantity: 30, dosage: '1 viên/ngày sau ăn sáng' },
      { name: 'Paracetamol 500mg', quantity: 20, dosage: '1 viên mỗi 4-6 giờ khi sốt' },
      { name: 'Amlodipine 5mg', quantity: 30, dosage: '1 viên/ngày buổi tối' },
      { name: 'Metformin 500mg', quantity: 30, dosage: '1 viên x 3 lần/ngày' },
      { name: 'Amoxicillin 500mg', quantity: 21, dosage: '1 viên x 3 lần/ngày' },
      { name: 'Vitamin C 1000mg', quantity: 30, dosage: '1 viên/ngày sau ăn sáng' },
      { name: 'Thuốc ho Strepsils', quantity: 20, dosage: 'Hút 1-2 viên mỗi 2 giờ' },
    ];

    const donThuocs = [];

    for (let i = 0; i < exams.length; i++) {
      const exam = exams[i];
      const numMedicines = Math.floor(Math.random() * 3) + 1; // 1-3 thuốc/đơn

      for (let j = 0; j < numMedicines; j++) {
        const medicine = medicines[Math.floor(Math.random() * medicines.length)];

        donThuocs.push({
          idDonThuoc: `DT-${uuidv4().slice(0, 8).toUpperCase()}`,
          tenThuoc: medicine.name,
          soLuong: medicine.quantity,
          lieuLuong: medicine.dosage,
          ngayKeDon: exam.ngayKham,
          approvedByDoctorId: exam.idBacSi,
          idLichSu: exam.idLichSu,
        });
      }
    }

    await knex('DonThuoc').insert(donThuocs);
    console.log(`  ✓ Tạo ${donThuocs.length} đơn thuốc`);

    console.log('\n✅ ═════════════════════════════════════════');
    console.log('✅ Seed dữ liệu thống kê hoàn tất!');
    console.log('✅ ═════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n✗ ═════════════════════════════════════════');
    console.error('✗ LỖI KHI SEED DỮ LIỆU:');
    console.error(error.message);
    console.error('✗ ═════════════════════════════════════════\n');
    throw error;
  }
};