const express = require("express");
const service = require("./service");

const router = express.Router();

router.get("/admin/create-student", (req, res) => {
  return res.render("admin-create-student/admin-create-student", {
    error: null,
    created: null,
  });
});

router.post("/admin/create-student", async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const className = String(req.body.className || "").trim();
    const dob = String(req.body.dob || "").trim();

    if (!fullName || !className) {
      return res.status(400).render("admin-create-student/admin-create-student", {
        error: "Vui long nhap day du ho ten va lop.",
        created: null,
      });
    }

    const created = await service.createStudentAccount({ fullName, className, dob });

    return res.render("admin-create-student/admin-create-student", {
      error: null,
      created,
    });
  } catch (error) {
    return res.status(400).render("admin-create-student/admin-create-student", {
      error: "Khong the tao tai khoan. Co the username da ton tai.",
      created: null,
    });
  }
});

module.exports = router;
