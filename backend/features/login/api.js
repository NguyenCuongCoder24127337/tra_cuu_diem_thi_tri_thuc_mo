const express = require("express");
const service = require("./service");

const router = express.Router();

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  const createdStudent = req.session.createdStudent || null;
  delete req.session.createdStudent;

  return res.render("login/login", {
    error: null,
    errorCode: null,
    createdStudent,
    previousAccount: "",
  });
});

router.post("/login", async (req, res) => {
  try {
    const account = String(req.body.account || req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!account || !password) {
      return res.render("login/login", {
        error: "Vui lòng nhập đầy đủ username và mật khẩu.",
        errorCode: "VALIDATION_ERROR",
        createdStudent: null,
        previousAccount: account,
      });
    }

    const result = await service.login(account, password);

    if (!result || result.errorCode) {
      const errorCode = result?.errorCode || "UNKNOWN_LOGIN_ERROR";
      const error =
        errorCode === "ACCOUNT_NOT_FOUND"
          ? "Tài khoản không tồn tại hoặc bạn nhập sai username."
          : errorCode === "WRONG_PASSWORD"
            ? "Mật khẩu không đúng hoặc username đã được đổi mật khẩu."
            : "Tài khoản hoặc mật khẩu không tồn tại.";

      return res.render("login/login", {
        error,
        errorCode,
        createdStudent: null,
        previousAccount: account,
      });
    }

    const student = result;

    req.session.user = student;

    return req.session.save((saveError) => {
      if (saveError) {
        return res.render("login/login", {
          error: "Khong the luu phien dang nhap. Vui long thu lai.",
          errorCode: "SESSION_SAVE_ERROR",
          createdStudent: null,
          previousAccount: account,
        });
      }

      if (student.mustChangePassword) {
        return res.redirect("/change-password");
      }

      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.render("login/login", {
      error: "Có lỗi hệ thống. Vui lòng thử lại.",
      errorCode: "SYSTEM_ERROR",
      createdStudent: null,
      previousAccount: account,
    });
  }
});

module.exports = router;
