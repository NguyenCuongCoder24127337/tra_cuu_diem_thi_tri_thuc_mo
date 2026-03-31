const bcrypt = require("bcrypt");
const model = require("./model");

async function login(account, password) {
  const student = await model.findStudentByAccountOrUsername(account);

  if (!student) {
    return null;
  }

  const accountValue = String(student.account || student.username || "");
  let isPasswordValid = false;

  // Try bcrypt verification if hash exists
  if (student.password_hash) {
    try {
      isPasswordValid = await bcrypt.compare(password, student.password_hash);
    } catch (err) {
      // Hash format is invalid/corrupted, treat as no hash
      console.warn("Invalid password_hash format for", accountValue);
      isPasswordValid = false;
    }
  }

  // Fallback: if no valid bcrypt hash or hash verification failed,
  // allow default credential (password = account) for first-time users
  const allowDefaultLogin =
    !isPasswordValid &&
    !!student.must_change_password &&
    password === accountValue;

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
