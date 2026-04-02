const model = require("./model");

function validateSuggestion(fullName, title, message) {
  const errors = [];

  if (!message || message.trim().length < 10) {
    errors.push("Nội dung góp ý không hợp lệ (tối thiểu 10 ký tự).");
  }

  return errors.length > 0 ? errors.join(" ") : null;
}

async function submitSuggestion({ fullName, email, phone, title, message }) {
  const error = validateSuggestion(fullName, title, message);
  if (error) {
    throw new Error(error);
  }

  return await model.insertSuggestion({
    fullName: fullName?.trim() || "Ẩn danh",
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    title: title?.trim() || "Góp ý phát triển web",
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
