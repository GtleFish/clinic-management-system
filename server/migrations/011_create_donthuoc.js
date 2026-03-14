/**
 * TABLE: DonThuoc
 * Mô tả: Thông tin đơn thuốc
 * FK: idBacSiTruong → BacSiTruong, idLichSu → LichSuKham
 */
exports.up = function(knex) {
  return knex.schema.createTable('DonThuoc', function(t) {
    t.string('idDonThuoc', 50).primary();          // PK
    t.string('tenThuoc', 100).notNullable();       // Tên thuốc
    t.integer('soLuong').notNullable();            // Số lượng
    t.string('lieuLuong', 100).notNullable();      // Liều lượng
    t.date('ngayKeDon').notNullable();             // Ngày kê (type không ghi trong BM04 → DATE)
    t.string('idBacSiTruong', 50).notNullable();   // FK → BacSiTruong
    t.string('idLichSu', 50).notNullable();        // FK → LichSuKham
    t.foreign('idBacSiTruong').references('idBacSiTruong').inTable('BacSiTruong').onDelete('RESTRICT');
    t.foreign('idLichSu').references('idLichSu').inTable('LichSuKham').onDelete('CASCADE');
  });
};
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('DonThuoc');
};
 