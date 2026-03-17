require("dotenv").config();
const express = require("express");
const cors = require("cors");

const buildCrudRouter = require("./routes/buildCrudRouter");
const CrudServiceClinic = require("./services/crudServiceClinic");
const InMemoryRepository = require("./repositories/inMemoryRepository");

const PatientRoutes = require("./routes/PatientRoutes");


app.use(cors());
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const repository = new InMemoryRepository();

const clinicService = new CrudServiceClinic({
  repository: repository,
  idField: "id",
});

app.use("/api/clinic", buildCrudRouter(clinicService));
app.use("/api/benhnhan", PatientRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const authRoutes = require("./routes/AuthRoutes");
app.use("/api/auth", authRoutes);
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
