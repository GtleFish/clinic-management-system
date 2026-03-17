exports.up = function(knex) {
  return knex.schema.alterTable('LichHen', function(t) {
    t.text('ghiChu').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('LichHen', function(t) {
    t.dropColumn('ghiChu');
  });
};