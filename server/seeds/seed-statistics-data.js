const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  console.log('🌱 Starting to seed statistics data...');

  // 1. Lấy dữ liệu cơ bản
  const doctors = await knex('BacSi').select('idBacSi', 'hoTen', 'idKhoa');
  const patients = await knex('BenhNhan').select('idBenhNhan', 'hoTen').limit(15);
  const departments = await knex('Khoa').select('idKhoa', 'tenKhoa');
  const headDoctors = await knex('BacSi')
    .select('idBacSi', 'hoTen')
    .where('isTruongKhoa', true)
    .limit(5);

  if (doctors.length === 0 || patients.length === 0 || departments.length === 0) {
    console.error('❌ Thiếu dữ liệu BacSi / BenhNhan / Khoa');
    return;
  }

  console.log(`✓ Found ${doctors.length} doctors, ${patients.length} patients`);

  // 2. LichHen
  const today = new Date();
  const appointments = [];

  for (let i = 0; i < 20; i++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() - Math.floor(Math.random() * 90));

    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const hours = ['08:00:00', '10:00:00', '14:00:00', '16:00:00'];

    appointments.push({
      idLichHen: `LH-${uuidv4().slice(0, 8).toUpperCase()}`,
      idBacSi: doctor.idBacSi,
      idBenhNhan: patient.idBenhNhan,
      ngayHen: appointmentDate.toISOString().split('T')[0],
      gioHen: hours[Math.floor(Math.random() * hours.length)],
      trangThai: Math.random() > 0.3 ? 'da_kham' : 'dang_cho',
    });
  }

  await knex('LichHen').insert(appointments);
  console.log(`✓ Inserted ${appointments.length} appointments`);

  // 3. LichSuKham
  const completedAppointments = appointments.filter(a => a.trangThai === 'da_kham');

  if (headDoctors.length > 0) {
    const exams = completedAppointments.slice(0, 12).map(appt => {
      const headDoctor = headDoctors[Math.floor(Math.random() * headDoctors.length)];

      return {
        idLichSu: `LSK-${uuidv4().slice(0, 8).toUpperCase()}`,
        idBacSi: headDoctor.idBacSi,
        idBenhNhan: appt.idBenhNhan,
        ngayKham: appt.ngayHen,
        chanDoan: 'Cảm cúm thông thường',
        huongDieuTri: 'Uống thuốc, nghỉ ngơi',
        trangThai: 'APPROVED',
        approvedByDoctorId: headDoctor.idBacSi,
      };
    });

    await knex('LichSuKham').insert(exams);
    console.log(`✓ Inserted ${exams.length} exam records`);
  }

  // 4. ThanhToan
  const payments = appointments.slice(0, 15).map(appt => {
    const paymentType = Math.random() > 0.5 ? 'khi_dat_lich' : 'khi_den_kham';
    const depositAmount = 300000 + Math.floor(Math.random() * 200000);

    return {
      idThanhToan: `TT-${uuidv4().slice(0, 8).toUpperCase()}`,
      idBenhNhan: appt.idBenhNhan,
      idLichHen: appt.idLichHen,
      soTienCoc: depositAmount,
      loaiThanhToan: paymentType,
      trangThai: 'da_coc',
      ngayTao: new Date(),
      ngayThanhToan: new Date(),
      ghiChu: 'Tiền cọc khám bệnh',
    };
  });

  await knex('ThanhToan').insert(payments);
  console.log(`✓ Inserted ${payments.length} payments`);

  console.log('✅ Seed data completed');
};