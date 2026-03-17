/**
 * TABLE: BacSi
 * Mô tả: Thông tin bác sĩ
 * FK: idKhoa → Khoa.idKhoa
 * Index: idx_bacsi_khoa (idKhoa)
 */
exports.up = function(knex) {
  return knex.schema.createTable('BacSi', function(t) {
    t.string('idBacSi', 50).primary();            // PK
    t.string('idKhoa', 50).notNullable();         // FK → Khoa
    t.string('hoTen', 100).notNullable();         // Họ tên
    t.string('chuyenKhoa', 100).notNullable();    // Chuyên khoa
    t.integer('namKinhNghiem').notNullable();      // Năm kinh nghiệm
    t.foreign('idKhoa').references('idKhoa').inTable('Khoa').onDelete('RESTRICT');
    t.index(['idKhoa'], 'idx_bacsi_khoa');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('BacSi');
};