/**
 * TABLE: Khoa
 * Mô tả: Thông tin khoa
 * Note: idBacSi (FK → BacSi) sẽ được thêm ở migration 005
 *       vì BacSi phụ thuộc Khoa (circular) → tạo Khoa trước, BacSi sau, rồi thêm FK
 */
exports.up = function(knex) {
  return knex.schema.createTable('Khoa', function(t) {
    t.string('idKhoa', 50).primary();          // PK
    t.string('idBacSi', 50).nullable();        // FK → BacSi (bác sĩ trưởng khoa) — thêm FK ở 005
    t.string('tenKhoa', 100).notNullable();    // Tên khoa
    t.text('moTa').nullable();                 // Mô tả
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('Khoa');
};
 