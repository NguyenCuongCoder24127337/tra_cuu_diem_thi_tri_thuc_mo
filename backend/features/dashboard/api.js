const express = require("express");
const { requireLogin } = require("../../core/sessionAuth");
const service = require("./service");

const router = express.Router();

router.get("/dashboard", requireLogin, async (req, res) => {
  if (req.session.user.mustChangePassword) {
    return res.redirect("/change-password");
  }

  try {
    const dashboard = await service.getDashboardData(req.session.user.id);

    return res.render("dashboard/dashboard", {
      student: req.session.user,
      subjects: dashboard.subjects,
      subjectLabels: dashboard.subjectLabels,
      scores: dashboard.scores,
      top3BySubject: dashboard.top3BySubject,
    });
  } catch (error) {
    return res.status(500).send("Khong the tai du lieu diem thi. Vui long thu lai.");
  }
});

module.exports = router;
