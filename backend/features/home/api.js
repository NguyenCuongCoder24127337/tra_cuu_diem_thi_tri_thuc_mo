const express = require("express");
const service = require("./service");

const router = express.Router();

router.get("/", (req, res) => {
  const data = service.buildHomeViewData(req.session.user);
  return res.render("home/home", { user: data.user });
});

module.exports = router;
