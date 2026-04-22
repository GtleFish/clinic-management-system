const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  try {
    console.log('🌱 Starting to seed statistics data...');

    // 1. Lấy danh sách bác sĩ, bệnh nhân, khoa
    const doctors = await knex('BacSi').select('idBacSi', 'hoTen', 'idKhoa');
    const patients = await knex('BenhNhan').select('idBenhNhan', 'hoTen').limit(15);
    const departments = await knex('Khoa').select('idKhoa', 'tenKhoa');
    const headDoctors = await knex('BacSiTruong').select('idBacSiTruong', 'hoTen').limit(5);

    if (doctors.length === 0 || patients.length === 0 || departments.length === 0) {
      console.error('❌ Thiếu dữ liệu cơ bản (BacSi, BenhNhan, Khoa)');
      return;
    }

    if (headDoctors.length === 0) {
      console.warn('⚠️ No head doctors found, skipping LichSuKham records');
    }

    console.log(`✓ Found ${doctors.length} doctors, ${patients.length} patients, ${departments.length} departments, ${headDoctors.length} head doctors`);

    // 2. Tạo dữ liệu LichHen (Appointments)
    const today = new Date();
    const appointments = [];

    for (let i = 0; i < 20; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() - Math.floor(Math.random() * 90));

      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const hours = ['08:00:00', '10:00:00', '14:00:00', '16:00:00'];
      const time = hours[Math.floor(Math.random() * hours.length)];

      appointments.push({
        idLichHen: `LH-${uuidv4().slice(0, 8).toUpperCase()}`,
        idBacSi: doctor.idBacSi,
        idBenhNhan: patient.idBenhNhan,
        ngayHen: appointmentDate.toISOString().split('T')[0],
        gioHen: time,
        trangThai: Math.random() > 0.3 ? 'da_kham' : 'dang_cho',
      });
    }

    // Insert LichHen
    for (const appt of appointments) {
      const exists = await knex('LichHen')
        .where({ idLichHen: appt.idLichHen })
        .first();

      if (!exists) {
        await knex('LichHen').insert(appt);
      }
    }

    console.log(`✓ Inserted ${appointments.length} appointments`);

    // 3. Tạo dữ liệu LichSuKham
    const completedAppointments = await knex('LichHen')
      .where('trangThai', 'da_kham')
      .limit(12);

    if (headDoctors.length > 0) {
      for (const appt of completedAppointments) {
        const examExists = await knex('LichSuKham')
          .where({ idBenhNhan: appt.idBenhNhan })
          .first();

        if (!examExists) {
          const headDoctor = headDoctors[Math.floor(Math.random() * headDoctors.length)];

          await knex('LichSuKham').insert({
            idLichSu: `LSK-${uuidv4().slice(0, 8).toUpperCase()}`,
            idBacSiTruong: headDoctor.idBacSiTruong,
            idBenhNhan: appt.idBenhNhan,
            ngayKham: appt.ngayHen,
            chanDoan: 'Cảm cúm thông thường',
            huongDieuTri: 'Uống thuốc hạ sốt, nghỉ ngơi, tái khám sau 3 ngày',
          });
        }
      }

      console.log(`✓ Inserted exam records`);
    } else {
      console.log('⏭️ Skipped LichSuKham (no head doctors)');
    }

    // 4. Tạo dữ liệu ThanhToan
    const allAppointments = await knex('LichHen')
      .select('idLichHen', 'idBenhNhan', 'ngayHen');

    const payments = [];

    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    for (const appt of allAppointments.slice(0, 15)) {
      const paymentType = Math.random() > 0.5 ? 'khi_dat_lich' : 'khi_den_kham';
      const depositAmount = 300000 + Math.floor(Math.random() * 200000);

      const paymentDate = new Date(appt.ngayHen);

      if (paymentType === 'khi_dat_lich') {
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 7));
      }

      payments.push({
        idThanhToan: `TT-${uuidv4().slice(0, 8).toUpperCase()}`,
        idBenhNhan: appt.idBenhNhan,
        idLichHen: appt.idLichHen,
        soTienCoc: depositAmount,
        loaiThanhToan: paymentType,
        trangThai: Math.random() > 0.2 ? 'da_coc' : 'thanh_toan_du',
        ngayTao: formatDateTime(paymentDate),
        ngayThanhToan: formatDateTime(new Date()),
        ghiChu: 'Tiền cọc khám bệnh',
      });
    }

    for (const payment of payments) {
      const exists = await knex('ThanhToan')
        .where({ idThanhToan: payment.idThanhToan })
        .first();

      if (!exists) {
        await knex('ThanhToan').insert(payment);
      }
    }

    console.log(`✓ Inserted ${payments.length} payment records`);

    console.log('✅ Seed data completed successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
  }
};