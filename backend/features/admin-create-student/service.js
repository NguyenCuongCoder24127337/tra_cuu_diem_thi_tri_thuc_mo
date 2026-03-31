const bcrypt = require("bcrypt");
const model = require("./model");

function removeVietnameseTones(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function buildUsername(fullName) {
  const normalizedName = removeVietnameseTones(fullName).replace(/[^a-zA-Z0-9]/g, "");
  return normalizedName;
}

async function buildUniqueUsername(fullName) {
  const base = buildUsername(fullName);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const exists = await model.findByUsername(candidate);
    if (!exists) {
      return candidate;
    }

    candidate = `${base}${suffix}`;
    suffix += 1;
  }
}

async function createStudentAccount({ fullName, className, dob }) {
  const username = await buildUniqueUsername(fullName);
  const passwordHash = await bcrypt.hash(username, 10);

  const student = await model.insertStudent({
    fullName,
    className,
    dob,
    username,
    passwordHash,
  });

  return {
    fullName: student.full_name,
    className: student.class_name,
    username: student.username,
    account: student.account || student.username,
    defaultPassword: username,
  };
}

module.exports = {
  createStudentAccount,
};
