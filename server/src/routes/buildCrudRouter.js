const express = require("express");

function buildCrudRouter(service) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const data = await service.getAll();
      res.json(data);
    } catch (error) { next(error); }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const data = await service.getById(Number(req.params.id));
      res.json(data);
    } catch (error) { next(error); }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = await service.create(req.body);
      res.status(201).json(data); // 201 Created
    } catch (error) { next(error); }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const data = await service.update(Number(req.params.id), req.body);
      res.json(data);
    } catch (error) { next(error); }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      await service.delete(Number(req.params.id));
      res.json({ message: "Xóa thành công" });
    } catch (error) { next(error); }
  });

  return router;
}

module.exports = buildCrudRouter;