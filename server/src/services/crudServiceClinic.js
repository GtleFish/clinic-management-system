class CrudServiceClinic {
  constructor(repository) {
    this.repository = repository;
  }

  validateData(data, isUpdate = false) {
    if (!isUpdate && !data.name) {
      throw new Error("Tên (name) là thông tin bắt buộc");
    }
    if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
      throw new Error("Tên (name) phải là một chuỗi ký tự hợp lệ");
    }
  
  }

  async getAll() {
    return this.repository.getAll();
  }

  async getById(id) {
    if (isNaN(id) || id <= 0) throw new Error("ID không hợp lệ");
    const item = await this.repository.getById(id);
    if (!item) throw new Error("Không tìm thấy dữ liệu");
    return item;
  }

  async create(data) {
    this.validateData(data);
    return this.repository.create(data);
  }

  async update(id, data) {
    if (isNaN(id) || id <= 0) throw new Error("ID không hợp lệ");
    if (!data || Object.keys(data).length === 0) throw new Error("Dữ liệu cập nhật không được để trống");
    
    this.validateData(data, true);

    const item = await this.repository.update(id, data);
    if (!item) throw new Error("Không tìm thấy dữ liệu để cập nhật");

    return item;
  }

  async delete(id) {
    if (isNaN(id) || id <= 0) throw new Error("ID không hợp lệ");
    
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy dữ liệu để xóa");

    return true;
  }
}

module.exports = CrudServiceClinic;