const bcrypt = require("bcrypt");
const model = require("./model");

function normalizeCredential(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function isLikelyBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$/.test(String(value || ""));
}

async function login(account, password) {
  const normalizedAccountInput = normalizeCredential(account);
  const normalizedPasswordInput = normalizeCredential(password);
  const student = await model.findStudentByAccountOrUsername(normalizedAccountInput);

  if (!student) {
    return null;
  }

  const accountValue = normalizeCredential(student.account || student.username || "");
  const usernameValue = normalizeCredential(student.username || "");
  let isPasswordValid = false;

  // Try bcrypt verification when hash format looks valid.
  if (student.password_hash && isLikelyBcryptHash(student.password_hash)) {
    try {
      isPasswordValid = await bcrypt.compare(normalizedPasswordInput, student.password_hash);
    } catch (err) {
      console.warn("Invalid password_hash format for", accountValue);
      isPasswordValid = false;
    }
  }

  // Safe fallback for first-time users:
  // allow default password when the account is marked must_change_password.
  const allowDefaultLogin =
    !isPasswordValid &&
    !!student.must_change_password &&
    (normalizedPasswordInput.toLowerCase() === accountValue.toLowerCase() ||
      normalizedPasswordInput.toLowerCase() === usernameValue.toLowerCase());

  if (!isPasswordValid && !allowDefaultLogin) {
    return null;
  }

  return {
    id: student.id,
    username: student.username,
    account: student.account || student.username,
    fullName: student.full_name,
    className: student.class_name,
    dob: student.dob,
    mustChangePassword: !!student.must_change_password,
  };
}

module.exports = {
  login,
};
