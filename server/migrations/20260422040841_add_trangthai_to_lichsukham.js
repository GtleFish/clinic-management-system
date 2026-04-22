exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('LichSuKham', 'trangThai');

  if (!hasColumn) {
    await knex.schema.alterTable('LichSuKham', function (t) {
      t.string('trangThai').defaultTo('PENDING');
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('LichSuKham', 'trangThai');

  if (hasColumn) {
    await knex.schema.alterTable('LichSuKham', function (t) {
      t.dropColumn('trangThai');
    });
  }
};