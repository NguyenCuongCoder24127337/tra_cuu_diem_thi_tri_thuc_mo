function clearSession(req) {
  return new Promise((resolve) => {
    req.session.destroy(() => {
      resolve();
    });
  });
}

module.exports = {
  clearSession,
};
