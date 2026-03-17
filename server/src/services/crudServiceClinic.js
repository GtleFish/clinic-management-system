class CrudServiceClinic {
    constructor(repository) {
      this.repository = repository;
    }
  
    async getAll() {
      return this.repository.getAll();
    }
  
    async getById(id) {
      return this.repository.getById(id);
    }
  
    async create(data) {
      if (!data.name) {
        throw new Error("Name is required");
      }
  
      return this.repository.create(data);
    }
  
    async update(id, data) {
      const item = await this.repository.update(id, data);
  
      if (!item) {
        throw new Error("Item not found");
      }
  
      return item;
    }
  
    async delete(id) {
      const deleted = await this.repository.delete(id);
  
      if (!deleted) {
        throw new Error("Item not found");
      }
  
      return true;
    }
  }
  
  module.exports = CrudServiceClinic;