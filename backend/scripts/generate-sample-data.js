/**
 * Script tạo 20 test data học sinh mẫu
 * Usage: node scripts/generate-sample-data.js
 * Output: SQL file có thể import trực tiếp vào Supabase
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const sampleStudents = [
  { fullName: "Nguyễn Văn A", className: "12A1", dob: "2006-01-15" },
  { fullName: "Trần Thị B", className: "12A1", dob: "2006-03-22" },
  { fullName: "Lê Minh C", className: "12A1", dob: "2006-05-10" },
  { fullName: "Phạm Thị D", className: "12A2", dob: "2006-07-08" },
  { fullName: "Hoàng Văn E", className: "12A2", dob: "2006-09-14" },
  { fullName: "Bùi Thị F", className: "12A2", dob: "2006-11-20" },
  { fullName: "Đặng Văn G", className: "12A3", dob: "2006-02-28" },
  { fullName: "Vũ Thị H", className: "12A3", dob: "2006-04-05" },
  { fullName: "Tô Minh I", className: "12A3", dob: "2006-06-12" },
  { fullName: "Nông Thị K", className: "12A4", dob: "2006-08-19" },
  { fullName: "Tạ Văn L", className: "12A4", dob: "2006-10-25" },
  { fullName: "Cao Thị M", className: "12A4", dob: "2006-12-30" },
  { fullName: "Dương Văn N", className: "12B1", dob: "2006-01-10" },
  { fullName: "Giang Thị O", className: "12B1", dob: "2006-03-15" },
  { fullName: "Hà Minh P", className: "12B1", dob: "2006-05-20" },
  { fullName: "Kiều Thị Q", className: "12B2", dob: "2006-07-25" },
  { fullName: "Lý Văn R", className: "12B2", dob: "2006-09-30" },
  { fullName: "Mỗi Thị S", className: "12B2", dob: "2006-11-05" },
  { fullName: "Nhất Văn T", className: "12B3", dob: "2006-02-10" },
  { fullName: "Ôn Thị U", className: "12B3", dob: "2006-04-15" },
];

// Hàm tạo username từ họ tên (loại bỏ dấu)
function generateUsername(fullName) {
  return fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

// Hàm tạo điểm ngẫu nhiên từ 0-10
function randomScore() {
  return Number((Math.random() * 10).toFixed(2));
}

async function generateSampleData() {
  console.log("🔄 Đang tạo test data...");

  let sqlStatements = [
    "-- Sample data for web tra cuu diem thi",
    "-- This file can be run in Supabase SQL Editor",
    "-- Make sure to run schema.sql first!",
    "",
  ];

  for (const student of sampleStudents) {
    const username = generateUsername(student.fullName);
    const account = username;
    // Tạo password hash từ username (mặc định password = username)
    const passwordHash = await bcrypt.hash(username, 10);

    const sql = `INSERT INTO public.result (
  full_name, class_name, dob, username, account, password_hash, must_change_password,
  toan, li, hoa, tieng_anh, van
) VALUES (
  '${student.fullName}',
  '${student.className}',
  '${student.dob}',
  '${username}',
  '${account}',
  '${passwordHash}',
  true,
  ${randomScore()}, ${randomScore()}, ${randomScore()}, ${randomScore()}, ${randomScore()}
);`;

    sqlStatements.push(sql);
  }

  const outputPath = path.join(__dirname, "import-sample-data.sql");
  fs.writeFileSync(outputPath, sqlStatements.join("\n"));

  console.log(`✅ Tạo thành công! File: ${outputPath}`);
  console.log("\n📋 Các tài khoản mẫu:");
  console.log("┌────────────────────────┬─────────────────────┬──────────────┐");
  console.log("│ Tên                    │ Username            │ Password     │");
  console.log("├────────────────────────┼─────────────────────┼──────────────┤");

  for (const student of sampleStudents) {
    const username = generateUsername(student.fullName);
    console.log(
      `│ ${student.fullName.padEnd(22)} │ ${username.padEnd(19)} │ ${username.padEnd(12)} │`
    );
  }

  console.log("└────────────────────────┴─────────────────────┴──────────────┘");
  console.log(
    "\n📌 Lưu ý: Password = Username cho tất cả tài khoản (bắt buộc đổi lần đầu đăng nhập)"
  );
}

generateSampleData().catch(console.error);
