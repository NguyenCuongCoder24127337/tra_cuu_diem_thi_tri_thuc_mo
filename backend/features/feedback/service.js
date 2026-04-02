const model = require("./model");

function validateSuggestion(message) {
  const errors = [];

  if (!message || message.trim().length < 10) {
    errors.push("Nội dung góp ý không hợp lệ (tối thiểu 10 ký tự).");
  }

  return errors.length > 0 ? errors.join(" ") : null;
}

async function submitSuggestion({ fullName, className, email, message }) {
  const error = validateSuggestion(message);
  if (error) {
    throw new Error(error);
  }

  return await model.insertSuggestion({
    fullName: fullName?.trim() || "Ẩn danh",
    className: className?.trim() || null,
    email: email?.trim() || null,
    message: message.trim(),
  });
}

async function getAllSuggestions() {
  return await model.getSuggestions();
}

module.exports = {
  submitSuggestion,
  getAllSuggestions,
};
