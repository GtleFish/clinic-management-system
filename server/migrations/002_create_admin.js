/**
 * TABLE: admin
 * FK: idUser → users.idUser
 * Index: idx_admin_user (idUser)
 */
exports.up = function(knex) {
  return knex.schema.createTable('admin', function(t) {
    t.string('idAdmin', 50).primary();         // PK
    t.string('quyenHan', 100).notNullable();   // Quyền hạn
    t.string('idUser', 50).notNullable();      // FK → users
    t.foreign('idUser').references('idUser').inTable('users').onDelete('CASCADE');
    t.index(['idUser'], 'idx_admin_user');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('admin');
};
 







