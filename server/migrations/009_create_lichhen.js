/**
 * TABLE: LichHen
 * Mô tả: Lịch hẹn khám
 * FK: idBenhNhan → BenhNhan, idBacSi → BacSi, idNhanVien → NhanVien
 */
exports.up = function(knex) {
  return knex.schema.createTable('LichHen', function(t) {
    t.string('idLichHen', 50).primary();       // PK
    t.date('ngayHen').notNullable();           // Ngày hẹn
    t.time('gioHen').notNullable();            // Giờ hẹn
    t.string('trangThai', 50).notNullable();   // Trạng thái
    t.string('idBenhNhan', 50).notNullable();  // FK → BenhNhan
    t.string('idBacSi', 50).notNullable();     // FK → BacSi
    t.string('idNhanVien', 50).nullable();     // FK → NhanVien
    t.foreign('idBenhNhan').references('idBenhNhan').inTable('BenhNhan').onDelete('RESTRICT');
    t.foreign('idBacSi').references('idBacSi').inTable('BacSi').onDelete('RESTRICT');
    t.foreign('idNhanVien').references('idNhanVien').inTable('NhanVien').onDelete('SET NULL');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('LichHen');
};