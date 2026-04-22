const knex = require('../src/db');

const createMorePatients = async () => {
  try {
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

    for (const name of patientNames) {
      const exists = await knex('BenhNhan').where({ hoTen: name }).first();
      if (!exists) {
        const cccd = `${Math.random().toString().substring(2, 14)}`.padEnd(12, '0');
        const birthDate = new Date(1975 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));

        await knex('BenhNhan').insert({
          idBenhNhan: `BN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          cccd: cccd,
          hoTen: name,
          gioiTinh: Math.random() > 0.5 ? 'Nam' : 'Nữ',
          ngaySinh: birthDate.toISOString().split('T')[0],
          tuoi: new Date().getFullYear() - birthDate.getFullYear(),
          gmail: `${name.toLowerCase().replace(/ /g, '')}@gmail.com`,
          sdt: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
          soBaoHiem: null,
          benhNen: null,
        });
      }
    }

    console.log('✅ Created more patients');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createMorePatients();
