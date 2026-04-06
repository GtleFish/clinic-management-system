const express = require("express");
const router = express.Router();
const authService = require("../services/AuthService");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.status(200).json(result);
  } catch (error) { 
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;