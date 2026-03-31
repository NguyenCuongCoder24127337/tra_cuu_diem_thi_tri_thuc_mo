const express = require("express");
const session = require("express-session");

function createApp({ viewsPath, staticPath, sessionSecret }) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", viewsPath);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
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
