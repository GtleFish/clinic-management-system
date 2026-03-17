const knex = require("../config/database");

class UserRepository {
  async create(data) {
    return knex("users").insert(data);
  }

  async findByUsername(username) {
    return knex("users").where({ username }).first();
  }
  async findById(idUser) {
    return knex("users").where({ idUser }).first();
  }
  
  async updatePassword(idUser, hashedPassword) {
    return knex("users").where({ idUser }).update({ password: hashedPassword });
  }
}

module.exports = new UserRepository();