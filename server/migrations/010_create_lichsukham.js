/**
 * TABLE: LichSuKham
 * Mô tả: Lịch sử khám bệnh
 * FK: idBenhNhan → BenhNhan, idBacSiTruong → BacSiTruong
 */
exports.up = function(knex) {
  return knex.schema.createTable('LichSuKham', function(t) {
    t.string('idLichSu', 50).primary();           // PK
    t.date('ngayKham').notNullable();             // Ngày khám
    t.text('chanDoan').notNullable();             // Chẩn đoán
    t.text('huongDieuTri').nullable();            // Hướng điều trị
    t.string('idBenhNhan', 50).notNullable();     // FK → BenhNhan
    t.string('idBacSiTruong', 50).notNullable();  // FK → BacSiTruong
    t.foreign('idBenhNhan').references('idBenhNhan').inTable('BenhNhan').onDelete('RESTRICT');
    t.foreign('idBacSiTruong').references('idBacSiTruong').inTable('BacSiTruong').onDelete('RESTRICT');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('LichSuKham');
};