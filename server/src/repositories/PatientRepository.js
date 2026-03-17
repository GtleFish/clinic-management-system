const knex = require("../config/database");

class PatientRepository {
  async create(data) {
    return knex("BenhNhan").insert(data);
  }

  async findByCCCD(cccd) {
    return knex("BenhNhan").where({ cccd }).first();
  }

  async findAll() {
    return knex("BenhNhan").select("*");
  }
  async findById(idBenhNhan) {
    return knex("BenhNhan").where({ idBenhNhan }).first();
  }

  // Đếm số bệnh nhân để tạo ID tăng dần
  async countAll() {
    const result = await knex("BenhNhan").count("idBenhNhan as total").first();
    return parseInt(result.total);
  }
  //Cập nhật hồ sơ bệnh nhân
  async update(idBenhNhan, data) {
    return knex("BenhNhan").where({ idBenhNhan }).update(data);
  }
  
}

module.exports = new PatientRepository();