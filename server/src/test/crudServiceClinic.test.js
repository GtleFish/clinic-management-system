const CrudServiceClinic = require("../services/crudServiceClinic");
const InMemoryRepository = require("../repositories/inMemoryRepository");

describe("CrudServiceClinic", () => {
  let service;

  beforeEach(() => {
    const repo = new InMemoryRepository();
    service = new CrudServiceClinic(repo);
  });

  test("create item", async () => {
    const result = await service.create({ name: "Khoa Noi" });

    expect(result.name).toBe("Khoa Noi");
  });
  
  test("get all items", async () => {
    await service.create({ name: "A" });
    await service.create({ name: "B" });

    const result = await service.getAll();

    expect(result.length).toBe(2);
  });

  test("get by id", async () => {
    const item = await service.create({ name: "Test" });

    const result = await service.getById(item.id);

    expect(result.id).toBe(item.id);
  });

  test("update item", async () => {
    const item = await service.create({ name: "Old" });
    
    const result = await service.update(item.id, { name: "New" });
    expect(result.name).toBe("New");
  });

  test("delete item", async () => {
    const item = await service.create({ name: "Delete" });
    await service.delete(item.id);
      await expect(service.getById(item.id)).rejects.toThrow("Không tìm thấy dữ liệu");
  });
});