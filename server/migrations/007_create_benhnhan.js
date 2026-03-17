/**
 * TABLE: BenhNhan
 * Mô tả: Thông tin bệnh nhân
 */
exports.up = function(knex) {
  return knex.schema.createTable('BenhNhan', function(t) {
    t.string('idBenhNhan', 50).primary();      // PK
    t.string('cccd', 20).notNullable().unique(); // UQ
    t.string('hoTen', 100).notNullable();      // Họ tên
    t.string('gioiTinh', 10).notNullable();    // Giới tính
    t.date('ngaySinh').notNullable();          // Ngày sinh
    t.integer('tuoi').nullable();              // Tuổi
    t.string('gmail', 100).nullable();         // Gmail (type không ghi trong BM04 → VARCHAR 100)
    t.string('sdt', 20).notNullable();         // Số điện thoại
    t.string('soBaoHiem', 50).nullable();      // Số bảo hiểm
    t.text('benhNen').nullable();              // Bệnh nền
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('BenhNhan');
};