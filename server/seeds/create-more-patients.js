exports.seed = async function (knex) {
  console.log('\n🌱 ═════════════════════════════════════════');
  console.log('🌱 Bắt đầu seed dữ liệu bệnh nhân...');
  console.log('🌱 ═════════════════════════════════════════\n');

  const patientNames = [
    'Nguyễn Văn A',
    'Trần Thị B',
    'Phạm Quang C',
    'Lê Minh D',
    'Hoàng Thu E',
    'Võ Hữu F',
    'Bùi Thành G',
    'Đặng Ánh H',
    'Phan Long I',
    'Tô Như J',
  ];

  let insertedCount = 0;

  for (const name of patientNames) {
    try {
      const exists = await knex('BenhNhan').where({ hoTen: name }).first();

      if (!exists) {
        // Sinh CCCD ngẫu nhiên (12 chữ số)
        const cccd = Math.floor(Math.random() * 999999999999)
          .toString()
          .padStart(12, '0');

        // Sinh ngày sinh ngẫu nhiên (từ 1975 đến 2010)
        const birthDate = new Date(
          1975 + Math.floor(Math.random() * 35),
          Math.floor(Math.random() * 12),
          1 + Math.floor(Math.random() * 28)
        );

        // Tính tuổi
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const age = currentYear - birthYear;

        // Sinh ID bệnh nhân ngẫu nhiên
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const idBenhNhan = `BN-${randomId}`;

        await knex('BenhNhan').insert({
          idBenhNhan: idBenhNhan,
          cccd: cccd,
          hoTen: name,
          gioiTinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
          ngaySinh: birthDate.toISOString().split('T')[0],
          tuoi: age,
          gmail: `${name.toLowerCase().replace(/ /g, '')}@gmail.com`,
          sdt: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          soBaoHiem: Math.random() > 0.3 ? `BH${Math.floor(Math.random() * 1000000000)}` : null,
          benhNen: Math.random() > 0.5 ? 'Tiểu đường' : null,
        });

        insertedCount++;
        console.log(`  ✓ Thêm bệnh nhân: ${name} (ID: ${idBenhNhan})`);
      } else {
        console.log(`  ⊘ Bệnh nhân đã tồn tại: ${name}`);
      }
    } catch (error) {
      console.error(`  ✗ Lỗi thêm ${name}:`, error.message);
    }
  }

  console.log(`\n✅ ═════════════════════════════════════════`);
  console.log(`✅ Seed ${insertedCount} bệnh nhân thành công!`);
  console.log(`✅ ═════════════════════════════════════════\n`);
};