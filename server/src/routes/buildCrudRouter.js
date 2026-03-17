const express = require("express");

function buildCrudRouter(service) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const data = await service.getAll();
    res.json(data);
  });

  router.get("/:id", async (req, res) => {
    const data = await service.getById(Number(req.params.id));
    res.json(data);
  });

  router.post("/", async (req, res) => {
    const data = await service.create(req.body);
    res.json(data);
  });

  router.put("/:id", async (req, res) => {
    const data = await service.update(Number(req.params.id), req.body);
    res.json(data);
  });

  router.delete("/:id", async (req, res) => {
    await service.delete(Number(req.params.id));
    res.json({ message: "Deleted" });
  });

  return router;
}

module.exports = buildCrudRouter;