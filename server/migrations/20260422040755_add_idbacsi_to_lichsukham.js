exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('LichSuKham', 'idBacSi');

  if (!hasColumn) {
    await knex.schema.alterTable('LichSuKham', function (t) {
      t.string('idBacSi').notNullable();

      t
        .foreign('idBacSi')
        .references('idBacSi')
        .inTable('BacSi')
        .onDelete('RESTRICT');
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('LichSuKham', 'idBacSi');

  if (hasColumn) {
    await knex.schema.alterTable('LichSuKham', function (t) {
      t.dropForeign(['idBacSi']);
      t.dropColumn('idBacSi');
    });
  }
};