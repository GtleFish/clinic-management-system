/**
 * TABLE: ThanhToan
 * Mô tả: Lịch sử thanh toán tiền cọc và thanh toán khám bệnh
 * FK: idBenhNhan → BenhNhan, idLichHen → LichHen (nullable)
 */
exports.up = function(knex) {
  return knex.schema.createTable('ThanhToan', function(t) {
    t.string('idThanhToan', 50).primary();        // PK: TT-{uuid}
    t.string('idBenhNhan', 50).notNullable();     // FK → BenhNhan (denormalized for queries)
    t.string('idLichHen', 50).nullable();         // FK → LichHen (nullable - payment can be standalone)
    t.decimal('soTienCoc', 12, 2).notNullable(); // Deposit/Payment amount in VND
    t.string('loaiThanhToan', 50).notNullable(); // "khi_dat_lich" OR "khi_den_kham"
    t.string('trangThai', 50).notNullable();     // "da_coc", "thanh_toan_du", "tra_lai"
    t.dateTime('ngayTao').notNullable();         // Payment record creation timestamp
    t.dateTime('ngayThanhToan').nullable();      // When payment completed (set when status changed)
    t.text('ghiChu').nullable();                 // Notes/Description

    // Foreign keys
    t.foreign('idBenhNhan').references('idBenhNhan').inTable('BenhNhan').onDelete('RESTRICT');
    t.foreign('idLichHen').references('idLichHen').inTable('LichHen').onDelete('SET NULL');

    // Indexes for query performance
    t.index('idBenhNhan', 'idx_thanhtoan_benhnhan');
    t.index('idLichHen', 'idx_thanhtoan_lichhen');
    t.index('ngayTao', 'idx_thanhtoan_ngaytao');
    t.index('trangThai', 'idx_thanhtoan_trangthai');
    t.index(['idBenhNhan', 'ngayTao'], 'idx_thanhtoan_benhnhan_ngay');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ThanhToan');
};
