const model = require("./model");

function buildHomeViewData(sessionUser) {
  return {
    user: sessionUser || null,
    meta: model.getHomeMetadata(),
  };
}

module.exports = {
  buildHomeViewData,
};
