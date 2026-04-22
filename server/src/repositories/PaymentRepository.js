const knex = require('../db');
const { v4: uuidv4 } = require('uuid');

class PaymentRepository {
  /**
   * Create a new payment record
   */
  async create(paymentData) {
    const {
      idBenhNhan,
      idLichHen = null,
      soTienCoc,
      loaiThanhToan,
      trangThai = 'da_coc',
      ghiChu = null,
    } = paymentData;

    const idThanhToan = `TT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const ngayTao = new Date().toISOString();

    try {
      await knex('ThanhToan').insert({
        idThanhToan,
        idBenhNhan,
        idLichHen,
        soTienCoc,
        loaiThanhToan,
        trangThai,
        ngayTao,
        ghiChu,
      });

      return {
        idThanhToan,
        idBenhNhan,
        idLichHen,
        soTienCoc,
        loaiThanhToan,
        trangThai,
        ngayTao,
      };
    } catch (err) {
      console.error('PaymentRepository.create error:', err);
      throw err;
    }
  }

  /**
   * Find payment by ID
   */
  async findById(idThanhToan) {
    try {
      const payment = await knex('ThanhToan')
        .where({ idThanhToan })
        .first();
      return payment || null;
    } catch (err) {
      console.error('PaymentRepository.findById error:', err);
      throw err;
    }
  }

  /**
   * Find payments by patient ID
   */
  async findByPatientId(idBenhNhan) {
    try {
      const payments = await knex('ThanhToan')
        .where({ idBenhNhan })
        .orderBy('ngayTao', 'desc');
      return payments || [];
    } catch (err) {
      console.error('PaymentRepository.findByPatientId error:', err);
      throw err;
    }
  }

  /**
   * Find payments by appointment ID
   */
  async findByAppointmentId(idLichHen) {
    try {
      const payments = await knex('ThanhToan')
        .where({ idLichHen })
        .orderBy('ngayTao', 'desc');
      return payments || [];
    } catch (err) {
      console.error('PaymentRepository.findByAppointmentId error:', err);
      throw err;
    }
  }

  /**
   * Update payment status
   */
  async updateStatus(idThanhToan, trangThai) {
    try {
      const updateData = { trangThai };

      // If status is being changed to completed, set completion date
      if (trangThai === 'thanh_toan_du') {
        updateData.ngayThanhToan = new Date().toISOString();
      }

      const result = await knex('ThanhToan')
        .where({ idThanhToan })
        .update(updateData);

      return result > 0;
    } catch (err) {
      console.error('PaymentRepository.updateStatus error:', err);
      throw err;
    }
  }

  /**
   * Update payment
   */
  async update(idThanhToan, paymentData) {
    try {
      const result = await knex('ThanhToan')
        .where({ idThanhToan })
        .update(paymentData);

      return result > 0;
    } catch (err) {
      console.error('PaymentRepository.update error:', err);
      throw err;
    }
  }

  /**
   * Delete payment
   */
  async delete(idThanhToan) {
    try {
      const result = await knex('ThanhToan')
        .where({ idThanhToan })
        .del();

      return result > 0;
    } catch (err) {
      console.error('PaymentRepository.delete error:', err);
      throw err;
    }
  }

  /**
   * Get all payments with filters
   */
  async findAll(filters = {}) {
    try {
      const {
        fromDate,
        toDate,
        trangThai,
        idBenhNhan,
        loaiThanhToan,
        limit = 100,
        offset = 0,
      } = filters;

      let query = knex('ThanhToan');

      if (fromDate && toDate) {
        query = query
          .where('ngayTao', '>=', `${fromDate} 00:00:00`)
          .where('ngayTao', '<=', `${toDate} 23:59:59`);
      }

      if (trangThai) {
        query = query.where('trangThai', trangThai);
      }

      if (idBenhNhan) {
        query = query.where('idBenhNhan', idBenhNhan);
      }

      if (loaiThanhToan) {
        query = query.where('loaiThanhToan', loaiThanhToan);
      }

      const payments = await query
        .orderBy('ngayTao', 'desc')
        .limit(limit)
        .offset(offset);

      const totalCount = await knex('ThanhToan')
        .count('* as count')
        .modify(qb => {
          if (fromDate && toDate) {
            qb.where('ngayTao', '>=', `${fromDate} 00:00:00`)
              .where('ngayTao', '<=', `${toDate} 23:59:59`);
          }
          if (trangThai) qb.where('trangThai', trangThai);
          if (idBenhNhan) qb.where('idBenhNhan', idBenhNhan);
          if (loaiThanhToan) qb.where('loaiThanhToan', loaiThanhToan);
        })
        .first();

      return {
        data: payments,
        total: totalCount?.count || 0,
      };
    } catch (err) {
      console.error('PaymentRepository.findAll error:', err);
      throw err;
    }
  }

  /**
   * Get payment statistics (aggregated)
   */
  async getStatistics(filters = {}) {
    try {
      const {
        fromDate,
        toDate,
        trangThai = 'da_coc',
        idKhoa,
      } = filters;

      let query = knex('ThanhToan')
        .sum('soTienCoc as totalAmount')
        .count('* as totalCount')
        .avg('soTienCoc as averageAmount')
        .where('ThanhToan.ngayTao', '>=', `${fromDate} 00:00:00`)
        .where('ThanhToan.ngayTao', '<=', `${toDate} 23:59:59`);

      if (trangThai) {
        query = query.where('ThanhToan.trangThai', trangThai);
      }

      if (idKhoa) {
        query = query
          .leftJoin('LichHen', 'ThanhToan.idLichHen', 'LichHen.idLichHen')
          .leftJoin('BacSi', 'LichHen.idBacSi', 'BacSi.idBacSi')
          .where(builder => {
            builder
              .where('BacSi.idKhoa', idKhoa)
              .orWhereNull('LichHen.idLichHen');
          });
      }

      const result = await query.first();

      return {
        totalAmount: result?.totalAmount ? parseFloat(result.totalAmount) : 0,
        totalCount: result?.totalCount || 0,
        averageAmount: result?.averageAmount ? parseFloat(result.averageAmount) : 0,
      };
    } catch (err) {
      console.error('PaymentRepository.getStatistics error:', err);
      throw err;
    }
  }
}

module.exports = new PaymentRepository();
