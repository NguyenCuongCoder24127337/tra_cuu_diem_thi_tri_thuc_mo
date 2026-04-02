const model = require("./model");

function validateSuggestion(fullName, title, message) {
  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Họ tên không hợp lệ (tối thiểu 2 ký tự).");
  }

  if (!title || title.trim().length < 5) {
    errors.push("Tiêu đề không hợp lệ (tối thiểu 5 ký tự).");
  }

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
    fullName: fullName.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    title: title.trim(),
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
