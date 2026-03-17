const InMemoryRepository = require("../repositories/inMemoryRepository");
const CrudServiceClinic = require("./crudServiceClinic");

const repository = new InMemoryRepository();

const clinicService = new CrudServiceClinic(repository);

module.exports = clinicService;