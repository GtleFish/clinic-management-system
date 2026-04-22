exports.up = async function (knex) {
  // 1. Thêm cột vào BacSi
  await knex.schema.alterTable('BacSi', function (t) {
    t.boolean('isTruongKhoa').defaultTo(false).notNullable();
    t.integer('phuCap').defaultTo(0).notNullable();
  });

  // 2. Migrate dữ liệu từ BacSiTruong → BacSi
  const bacSiTruong = await knex('BacSiTruong').select('*');

  for (const bst of bacSiTruong) {
    const existingBacSi = await knex('BacSi')
      .where('hoTen', bst.hoTen)
      .first();

    if (existingBacSi) {
      // update bác sĩ thành trưởng khoa
      await knex('BacSi')
        .where('idBacSi', existingBacSi.idBacSi)
        .update({
          isTruongKhoa: true,
          phuCap: bst.phuCap,
        });

      // map sang approvedByDoctorId (KHÔNG đụng idBacSi)
      await knex('LichSuKham')
        .where('idBacSiTruong', bst.idBacSiTruong)
        .update({ approvedByDoctorId: existingBacSi.idBacSi });

      await knex('DonThuoc')
        .where('idBacSiTruong', bst.idBacSiTruong)
        .update({ approvedByDoctorId: existingBacSi.idBacSi });
    }
  }

  // 3. Thêm cột approvedByDoctorId
  await knex.schema.alterTable('LichSuKham', function (t) {
    t.string('approvedByDoctorId').nullable();
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t.string('approvedByDoctorId').nullable();
  });

  // 4. Thêm FK mới
  await knex.schema.alterTable('LichSuKham', function (t) {
    t
      .foreign('approvedByDoctorId')
      .references('idBacSi')
      .inTable('BacSi')
      .onDelete('SET NULL');
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t
      .foreign('approvedByDoctorId')
      .references('idBacSi')
      .inTable('BacSi')
      .onDelete('SET NULL');
  });

  // 5. Xoá FK cũ
  await knex.schema.alterTable('LichSuKham', function (t) {
    t.dropForeign(['idBacSiTruong']);
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t.dropForeign(['idBacSiTruong']);
  });

  // 6. Xoá cột cũ
  await knex.schema.alterTable('LichSuKham', function (t) {
    t.dropColumn('idBacSiTruong');
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t.dropColumn('idBacSiTruong');
  });

  // 7. Xoá bảng BacSiTruong
  await knex.schema.dropTableIfExists('BacSiTruong');
};

exports.down = async function (knex) {
  // 1. Tạo lại bảng BacSiTruong
  await knex.schema.createTable('BacSiTruong', function (t) {
    t.string('idBacSiTruong', 50).primary();
    t.string('hoTen', 100).notNullable();
    t.integer('phuCap').notNullable();
  });

  // 2. Thêm lại cột cũ
  await knex.schema.alterTable('LichSuKham', function (t) {
    t.string('idBacSiTruong');
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t.string('idBacSiTruong');
  });

  // 3. Thêm lại FK cũ
  await knex.schema.alterTable('LichSuKham', function (t) {
    t
      .foreign('idBacSiTruong')
      .references('idBacSiTruong')
      .inTable('BacSiTruong')
      .onDelete('RESTRICT');
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t
      .foreign('idBacSiTruong')
      .references('idBacSiTruong')
      .inTable('BacSiTruong')
      .onDelete('RESTRICT');
  });

  // 4. Xoá cột approvedByDoctorId
  await knex.schema.alterTable('LichSuKham', function (t) {
    t.dropForeign(['approvedByDoctorId']);
    t.dropColumn('approvedByDoctorId');
  });

  await knex.schema.alterTable('DonThuoc', function (t) {
    t.dropForeign(['approvedByDoctorId']);
    t.dropColumn('approvedByDoctorId');
  });

  // 5. Xoá cột thêm vào BacSi
  await knex.schema.alterTable('BacSi', function (t) {
    t.dropColumn('isTruongKhoa');
    t.dropColumn('phuCap');
  });
};