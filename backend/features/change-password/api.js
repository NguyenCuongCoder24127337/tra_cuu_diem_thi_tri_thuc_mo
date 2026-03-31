const express = require("express");
const { requireLogin } = require("../../core/sessionAuth");
const service = require("./service");

const router = express.Router();

router.get("/change-password", requireLogin, (req, res) => {
  if (!req.session.user.mustChangePassword) {
    return res.redirect("/dashboard");
  }

  return res.render("change-password/change-password", { error: null });
});

router.post("/change-password", requireLogin, async (req, res) => {
  try {
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    const errorMessage = service.validatePassword(newPassword, confirmPassword);

    if (errorMessage) {
      return res.status(400).render("change-password/change-password", {
        error: errorMessage,
      });
    }

    await service.changePassword(req.session.user.id, newPassword);
    req.session.user.mustChangePassword = false;

    return req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).render("change-password/change-password", {
          error: "Khong the cap nhat phien dang nhap. Vui long thu lai.",
        });
      }

      return res.redirect("/dashboard");
    });
  } catch (error) {
    return res.status(500).render("change-password/change-password", {
      error: "Khong the doi mat khau luc nay. Vui long thu lai.",
    });
  }
});

module.exports = router;
