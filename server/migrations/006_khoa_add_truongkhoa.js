/**
 * TABLE: BacSiTruong
 * Mô tả: Thông tin bác sĩ trưởng
 */
exports.up = function(knex) {
  return knex.schema.createTable('BacSiTruong', function(t) {
    t.string('idBacSiTruong', 50).primary();   // PK
    t.string('hoTen', 100).notNullable();      // Họ tên
    t.integer('phuCap').notNullable();         // Phụ cấp
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('BacSiTruong');
};