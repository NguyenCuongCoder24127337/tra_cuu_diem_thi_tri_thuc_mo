const express = require("express");
const service = require("./service");

const router = express.Router();

// POST: Submit new suggestion
router.post("/api/feedback/submit", async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = String(req.body.email || "").trim();
    const phone = String(req.body.phone || "").trim();
    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();

    if (!fullName || !title || !message) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng nhập đầy đủ họ tên, tiêu đề và nội dung góp ý.",
      });
    }

    const suggestion = await service.submitSuggestion({
      fullName,
      email,
      phone,
      title,
      message,
    });

    return res.json({
      success: true,
      message: "Cảm ơn góp ý của bạn. Chúng tôi sẽ xem xét và cải thiện.",
      data: suggestion,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Không thể gửi góp ý. Vui lòng thử lại.",
    });
  }
});

// GET: Admin view all suggestions (protected)
router.get("/api/admin/suggestions", async (req, res) => {
  try {
    // TODO: Add authentication check here
    const suggestions = await service.getAllSuggestions();
    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Không thể lấy danh sách góp ý.",
    });
  }
});

module.exports = router;
