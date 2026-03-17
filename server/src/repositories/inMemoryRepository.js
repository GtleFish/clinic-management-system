class InMemoryRepository {
    constructor() {
      this.data = [];
      this.currentId = 1;
    }
  
    async getAll() {
      return this.data;
    }
  
    async getById(id) {
      return this.data.find((item) => item.id === id);
    }
  
    async create(item) {
      const newItem = {
        id: this.currentId++,
        ...item,
      };
  
      this.data.push(newItem);
      return newItem;
    }
  
    async update(id, updateData) {
      const index = this.data.findIndex((item) => item.id === id);
  
      if (index === -1) return null;
  
      this.data[index] = {
        ...this.data[index],
        ...updateData,
      };
  
      return this.data[index];
    }
  
    async delete(id) {
      const index = this.data.findIndex((item) => item.id === id);
  
      if (index === -1) return false;
  
      this.data.splice(index, 1);
      return true;
    }
  }
  
module.exports = InMemoryRepository;