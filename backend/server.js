const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const { createApp } = require("./core/appFactory");
const homeApi = require("./features/home/api");
const loginApi = require("./features/login/api");
const changePasswordApi = require("./features/change-password/api");
const logoutApi = require("./features/logout/api");
const dashboardApi = require("./features/dashboard/api");
const adminCreateStudentApi = require("./features/admin-create-student/api");

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SESSION_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const port = Number(process.env.PORT || 3000);

const app = createApp({
  viewsPath: path.join(__dirname, "..", "frontend", "ui"),
  staticPath: path.join(__dirname, "..", "frontend", "public"),
  sessionSecret: process.env.SESSION_SECRET,
});

app.use(homeApi);
app.use(loginApi);
app.use(changePasswordApi);
app.use(logoutApi);
app.use(dashboardApi);
app.use(adminCreateStudentApi);

app.use((req, res) => {
  res.status(404).send("Trang khong ton tai");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
