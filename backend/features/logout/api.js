const express = require("express");
const { requireLogin } = require("../../core/sessionAuth");
const service = require("./service");

const router = express.Router();

router.post("/logout", requireLogin, async (req, res) => {
  await service.logout(req);
  return res.redirect("/login");
});

module.exports = router;
