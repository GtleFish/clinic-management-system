/**
 * TABLE: NhanVien
 * Mô tả: BM04 dùng idNhanVien trong LichHen nhưng không định nghĩa bảng riêng.
 *        Tạo bảng này để đảm bảo FK hợp lệ.
 */
exports.up = function(knex) {
  return knex.schema.createTable('NhanVien', function(t) {
    t.string('idNhanVien', 50).primary();      // PK
    t.string('hoTen', 100).notNullable();      // Họ tên
    t.string('idUser', 50).nullable();         // FK → users
    t.foreign('idUser').references('idUser').inTable('users').onDelete('SET NULL');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('NhanVien');
};