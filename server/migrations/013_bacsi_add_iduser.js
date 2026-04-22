exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('BacSi', 'idUser');

  if (!hasColumn) {
    await knex.schema.alterTable('BacSi', function (t) {
      t.string('idUser', 50).nullable();

      t
        .foreign('idUser')
        .references('idUser')
        .inTable('users')
        .onDelete('SET NULL');
    });
  }
};

exports.down = async function (knex) {
  const hasColumn = await knex.schema.hasColumn('BacSi', 'idUser');

  if (hasColumn) {
    await knex.schema.alterTable('BacSi', function (t) {
      t.dropForeign(['idUser']);
      t.dropColumn('idUser');
    });
  }
};