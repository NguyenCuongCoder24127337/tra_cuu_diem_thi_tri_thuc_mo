const bcrypt = require("bcrypt");
const model = require("./model");

function validatePassword(newPassword, confirmPassword) {
  if (newPassword.length < 6) {
    return "Mat khau moi phai co it nhat 6 ky tu.";
  }

  if (newPassword !== confirmPassword) {
    return "Xac nhan mat khau khong khop.";
  }

  return null;
}

async function changePassword(studentId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await model.updatePassword(studentId, passwordHash);
}

module.exports = {
  validatePassword,
  changePassword,
};
