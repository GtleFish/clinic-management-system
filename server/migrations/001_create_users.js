/**
 * TABLE: users
 * Mô tả: Lưu thông tin người dùng hệ thống
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(t) {
    t.string('idUser', 50).primary();          // PK
    t.string('role', 20).notNullable();        // Vai trò
    t.string('username', 50).notNullable().unique(); // UQ
    t.string('password', 255).notNullable();   // Mật khẩu
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
 