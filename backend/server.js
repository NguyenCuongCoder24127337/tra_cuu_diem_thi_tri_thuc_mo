const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const { createApp } = require("./core/appFactory");
const { createSessionStore } = require("./core/sessionStore");
const homeApi = require("./features/home/api");
const loginApi = require("./features/login/api");
const changePasswordApi = require("./features/change-password/api");
const logoutApi = require("./features/logout/api");
const dashboardApi = require("./features/dashboard/api");
const feedbackApi = require("./features/feedback/api");

async function bootstrap() {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SESSION_SECRET", "REDIS_URL"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  const port = Number(process.env.PORT || 3000);
  let redisClient = null;
  let sessionStore = null;

  try {
    const result = await createSessionStore(process.env.REDIS_URL);
    redisClient = result.client;
    sessionStore = result.store;
    if (result.isMemoryStore) {
      console.warn("Redis URL not set. Using in-memory session store for local development.");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    console.warn("Redis unavailable. Falling back to in-memory session store for local development.");
    const session = require("express-session");
    sessionStore = new session.MemoryStore();
  }

  const app = createApp({
    viewsPath: path.join(__dirname, "..", "frontend", "ui"),
    staticPath: path.join(__dirname, "..", "frontend", "public"),
    sessionSecret: process.env.SESSION_SECRET,
    sessionStore,
    isProduction: process.env.NODE_ENV === "production",
  });

  app.use(homeApi);
  app.use(loginApi);
  app.use(changePasswordApi);
  app.use(logoutApi);
  app.use(dashboardApi);
  app.use(feedbackApi);

  app.use((req, res) => {
    res.status(404).send("Trang không tồn tại");
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  const shutdown = async () => {
    if (redisClient?.isOpen) {
      await redisClient.quit();
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  console.error("Server bootstrap failed:", error.message);
  process.exit(1);
});
