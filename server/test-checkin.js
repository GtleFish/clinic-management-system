/**
 * Script test check-in functionality
 * Run: node test-checkin.js
 */

const knex = require('./src/db');

async function testCheckIn() {
  try {
    console.log('🧪 Testing check-in functionality...\n');

    // 1. Lấy một lịch hẹn chưa check-in
    const lichHen = await knex('LichHen')
      .whereNotIn('trangThai', ['cho_kham', 'da_checkin', 'huy'])
      .first();

    if (!lichHen) {
      console.log('❌ Không tìm thấy lịch hẹn để test');
      console.log('💡 Chạy: npx knex seed:run để tạo dữ liệu test');
      process.exit(1);
    }

    console.log('✓ Tìm thấy lịch hẹn:', lichHen.idLichHen);
    console.log('  - Trạng thái:', lichHen.trangThai);
    console.log('  - Bệnh nhân:', lichHen.idBenhNhan);
    console.log('  - Ngày hẹn:', lichHen.ngayHen);

    // 2. Kiểm tra thanh toán hiện tại
    const existingPayment = await knex('ThanhToan')
      .where({ idLichHen: lichHen.idLichHen })
      .first();

    console.log('\n✓ Thanh toán hiện tại:', existingPayment ? 'Có' : 'Không');
    if (existingPayment) {
      console.log('  - ID:', existingPayment.idThanhToan);
      console.log('  - Số tiền:', existingPayment.soTienCoc);
      console.log('  - Trạng thái:', existingPayment.trangThai);
    }

    // 3. Simulate check-in
    console.log('\n🔄 Đang thực hiện check-in...');
    
    const { v4: uuidv4 } = require('uuid');
    const depositAmount = 300000;

    await knex.transaction(async (trx) => {
      // Update lịch hẹn
      await trx('LichHen')
        .where({ idLichHen: lichHen.idLichHen })
        .update({ trangThai: 'cho_kham' });

      console.log('  ✓ Cập nhật trạng thái lịch hẹn');

      // Create/Update thanh toán
      if (existingPayment) {
        await trx('ThanhToan')
          .where({ idThanhToan: existingPayment.idThanhToan })
          .update({
            trangThai: 'da_coc',
            soTienCoc: depositAmount,
            ngayThanhToan: knex.fn.now(),
            ghiChu: 'Test check-in tự động',
          });
        console.log('  ✓ Cập nhật thanh toán');
      } else {
        const newPaymentId = `TT-${uuidv4().slice(0, 8).toUpperCase()}`;
        await trx('ThanhToan').insert({
          idThanhToan: newPaymentId,
          idBenhNhan: lichHen.idBenhNhan,
          idLichHen: lichHen.idLichHen,
          soTienCoc: depositAmount,
          loaiThanhToan: 'khi_den_kham',
          trangThai: 'da_coc',
          ngayTao: knex.fn.now(),
          ngayThanhToan: knex.fn.now(),
          ghiChu: 'Test check-in tự động',
        });
        console.log('  ✓ Tạo mới thanh toán:', newPaymentId);
      }
    });

    // 4. Verify kết quả
    console.log('\n✅ Check-in thành công!');
    
    const updatedLichHen = await knex('LichHen')
      .where({ idLichHen: lichHen.idLichHen })
      .first();
    
    const updatedPayment = await knex('ThanhToan')
      .where({ idLichHen: lichHen.idLichHen })
      .first();

    console.log('\n📊 Kết quả:');
    console.log('  - Trạng thái lịch hẹn:', updatedLichHen.trangThai);
    console.log('  - ID thanh toán:', updatedPayment.idThanhToan);
    console.log('  - Số tiền cọc:', updatedPayment.soTienCoc);
    console.log('  - Trạng thái thanh toán:', updatedPayment.trangThai);
    console.log('  - Ngày thanh toán:', updatedPayment.ngayThanhToan);

    console.log('\n✅ Test hoàn tất!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCheckIn();
