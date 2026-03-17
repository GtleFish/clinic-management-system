// server/db.js  — kết nối database dùng chung toàn app
const knex = require('knex')(require('../knexfile').development);
module.exports = knex;