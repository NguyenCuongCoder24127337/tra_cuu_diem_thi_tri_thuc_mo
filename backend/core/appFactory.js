const express = require("express");
const session = require("express-session");

function createApp({ viewsPath, staticPath, sessionSecret, sessionStore, isProduction }) {
  const app = express();

  // Render/Reverse proxy: required so secure cookies can be set correctly.
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.set("view engine", "ejs");
  app.set("views", viewsPath);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      secret: sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: !!isProduction,
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );

  app.use(express.static(staticPath));

  return app;
}

module.exports = {
  createApp,
};
