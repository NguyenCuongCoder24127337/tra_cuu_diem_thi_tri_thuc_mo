const express = require("express");
const service = require("./service");

const router = express.Router();

router.get("/api/home/find-account", async (req, res) => {
  const keyword = String(req.query.q || "").trim();

  if (!keyword) {
    return res.status(400).json({ error: "Vui long nhap ten de tra cuu." });
  }

  try {
    const items = await service.lookupAccountsByFirstName(keyword);
    return res.json({ items });
  } catch (error) {
    console.error("Home account lookup error:", error);
    return res.status(500).json({ error: "Khong the tra cuu username luc nay." });
  }
});

router.get("/", (req, res) => {
  const data = service.buildHomeViewData(req.session.user);
  return res.render("home/home", { user: data.user });
});

module.exports = router;
