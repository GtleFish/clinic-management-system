/**
 * TABLE: RefreshTokens
 * Mô tả: Lưu refresh token để hỗ trợ cơ chế token rotation
 */
exports.up = function (knex) {
  return knex.schema.createTable('RefreshTokens', function (t) {
    t.increments('id').primary();
    t.string('idUser', 50).notNullable();
    t.string('token', 255).notNullable().unique();
    t.datetime('expiresAt').notNullable();
    t.datetime('createdAt').defaultTo(knex.fn.now());
    t.foreign('idUser').references('idUser').inTable('users').onDelete('CASCADE');
    t.index(['token'], 'idx_refresh_token');
    t.index(['idUser'], 'idx_refresh_user');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('RefreshTokens');
};
