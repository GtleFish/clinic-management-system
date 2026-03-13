/**
 * Thêm FK cho Khoa.idBacSi → BacSi.idBacSi
 * (giải quyết circular dependency Khoa ↔ BacSi)
 */
exports.up = function(knex) {
  return knex.schema.alterTable('Khoa', function(t) {
    t.foreign('idBacSi').references('idBacSi').inTable('BacSi').onDelete('SET NULL');
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable('Khoa', function(t) {
    t.dropForeign(['idBacSi']);
  });
};