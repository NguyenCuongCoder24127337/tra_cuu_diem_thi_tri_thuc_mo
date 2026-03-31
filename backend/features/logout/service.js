const model = require("./model");

async function logout(req) {
  await model.clearSession(req);
}

module.exports = {
  logout,
};
