const bcrypt = require("bcrypt");
const model = require("./model");

async function login(account, password) {
  const student = await model.findStudentByAccountOrUsername(account);

  if (!student) {
    return null;
  }

  const matched = await bcrypt.compare(password, student.password_hash || "");
  const accountValue = String(student.account || student.username || "");

  // Compatibility path: some legacy rows may have inconsistent hashes.
  // Only allow default credential fallback on first-login accounts.
  const allowLegacyDefaultLogin =
    !matched && !!student.must_change_password && password === accountValue;

  if (!matched && !allowLegacyDefaultLogin) {
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
