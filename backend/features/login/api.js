const express = require("express");
const service = require("./service");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  const createdStudent = req.session.createdStudent || null;
  delete req.session.createdStudent;

  return res.render("login/login", { error: null, createdStudent });
});

router.post("/login", async (req, res) => {
  try {
    const account = String(req.body.account || req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!account || !password) {
      return res.render("login/login", {
        error: "Vui lòng nhập đầy đủ account và mật khẩu.",
      });
    }

    const student = await service.login(account, password);

    if (!student) {
      return res.render("login/login", {
        error: "Thông tin đăng nhập không đúng.",
      });
    }

    req.session.user = student;

    return req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).render("login/login", {
          error: "Khong the luu phien dang nhap. Vui long thu lai.",
        });
      }

      if (student.mustChangePassword) {
        return res.redirect("/change-password");
      }

      return res.redirect("/dashboard");
    });
  } catch (error) {
    return res.render("login/login", {
      error: "Có lỗi hệ thống. Vui lòng thử lại.",
    });
  }
});

module.exports = router;
