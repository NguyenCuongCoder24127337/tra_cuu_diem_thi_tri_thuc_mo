const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function removeVietnameseTones(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeText(value) {
  return removeVietnameseTones(String(value || ""))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildUsername(fullName) {
  const normalizedName = removeVietnameseTones(fullName).replace(/[^a-zA-Z0-9]/g, "");
  return normalizedName;
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }

  return null;
}

function normalizeDob(rawDob) {
  if (!rawDob) {
    return null;
  }

  if (rawDob instanceof Date && !Number.isNaN(rawDob.getTime())) {
    return rawDob.toISOString().slice(0, 10);
  }

  if (typeof rawDob === "number") {
    const parsed = XLSX.SSF.parse_date_code(rawDob);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${mm}-${dd}`;
    }
  }

  const s = String(rawDob).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const m = s.match(dmy);
  if (m) {
    const dd = String(m[1]).padStart(2, "0");
    const mm = String(m[2]).padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function parseOptionalScore(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { hasValue: false, value: 0 };
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    return { hasValue: false, value: 0 };
  }

  return { hasValue: true, value };
}

function mapSubject(rawSubject) {
  const text = normalizeText(rawSubject);

  if (!text) {
    return null;
  }
  if (text.includes("toan") || text === "math") {
    return "toan";
  }
  if (text.includes("ly") || text.includes("li") || text.includes("vat ly") || text === "physics") {
    return "li";
  }
  if (text.includes("hoa") || text.includes("hoa hoc") || text === "chemistry") {
    return "hoa";
  }
  if (text.includes("tieng anh") || text === "anh" || text === "english") {
    return "tieng_anh";
  }
  if (text.includes("ngu van") || text === "van" || text === "literature") {
    return "van";
  }

  return null;
}

function normalizeStudentKey(fullName, className) {
  return `${normalizeText(fullName)}|${normalizeText(className)}`;
}

function extractEntriesFromRow(row, sheetName) {
  const fullName = String(
    pick(row, [
      "ho_va_ten",
      "ho_ten",
      "full_name",
      "name",
      "ho va ten",
      "họ và tên",
      "__EMPTY",
      "Họ và Tên",
    ]) || ""
  ).trim();

  const className = String(
    pick(row, ["lop", "class_name", "class", "lớp", "__EMPTY_1", "Lớp"]) || ""
  ).trim();

  const isHeaderRow = normalizeText(fullName) === "ho va ten" || normalizeText(className) === "lop";
  if (isHeaderRow || !fullName) {
    return [];
  }

  const dobRaw = pick(row, ["ngay_sinh", "dob", "date_of_birth", "ngày sinh", "ngay thang nam sinh"]);
  const dob = normalizeDob(dobRaw);
  const entries = [];

  const subjectFromColumn = mapSubject(
    pick(row, ["mon_thi", "môn thi", "subject", "__EMPTY_2", "Môn Thi"]) || sheetName
  );
  const scoreFromColumn = parseOptionalScore(
    pick(row, ["diem_thi", "điểm thi", "score", "__EMPTY_5", "Điểm Thi"])
  );

  if (subjectFromColumn && scoreFromColumn.hasValue) {
    entries.push({ fullName, className, dob, subject: subjectFromColumn, score: scoreFromColumn.value });
  }

  const directSubjects = {
    toan: pick(row, ["toan", "math"]),
    li: pick(row, ["li", "ly", "physics"]),
    hoa: pick(row, ["hoa", "chemistry"]),
    tieng_anh: pick(row, ["tieng_anh", "tieng anh", "english"]),
    van: pick(row, ["van", "literature"]),
  };

  for (const [subject, rawScore] of Object.entries(directSubjects)) {
    const parsed = parseOptionalScore(rawScore);
    if (!parsed.hasValue) {
      continue;
    }

    entries.push({ fullName, className, dob, subject, score: parsed.value });
  }

  return entries;
}

function aggregateEntries(entries) {
  const nameClassCandidates = new Map();

  for (const entry of entries) {
    const nameKey = normalizeText(entry.fullName);
    const classValue = String(entry.className || "").trim();
    if (!nameKey || !classValue) {
      continue;
    }

    if (!nameClassCandidates.has(nameKey)) {
      nameClassCandidates.set(nameKey, new Set());
    }
    nameClassCandidates.get(nameKey).add(classValue);
  }

  const map = new Map();

  for (const entry of entries) {
    let resolvedClassName = String(entry.className || "").trim();
    if (!resolvedClassName) {
      const candidates = nameClassCandidates.get(normalizeText(entry.fullName));
      if (candidates && candidates.size === 1) {
        resolvedClassName = [...candidates][0];
      }
    }

    if (!resolvedClassName) {
      continue;
    }

    const key = normalizeStudentKey(entry.fullName, resolvedClassName);
    if (!map.has(key)) {
      map.set(key, {
        fullName: entry.fullName,
        className: resolvedClassName,
        dob: entry.dob || null,
        scores: { toan: null, li: null, hoa: null, tieng_anh: null, van: null },
      });
    }

    const student = map.get(key);
    if (!student.dob && entry.dob) {
      student.dob = entry.dob;
    }

    if (entry.subject && typeof entry.score === "number") {
      student.scores[entry.subject] = entry.score;
    }
  }

  return [...map.values()];
}

async function findResultByUsername(username) {
  const { data, error } = await supabase.from("result").select("id").eq("username", username).maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

async function findResultByFullClass(fullName, className) {
  const { data, error } = await supabase
    .from("result")
    .select("id, username")
    .eq("full_name", fullName)
    .eq("class_name", className)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function generateUniqueUsername(baseUsername) {
  let candidate = baseUsername;
  let suffix = 2;

  while (true) {
    const exists = await findResultByUsername(candidate);
    if (!exists) {
      return candidate;
    }

    candidate = `${baseUsername}${suffix}`;
    suffix += 1;
  }
}

async function createResultRow(studentData, username) {
  const passwordHash = await bcrypt.hash(username, 10);
  const { data, error } = await supabase
    .from("result")
    .insert({
      full_name: studentData.fullName,
      class_name: studentData.className,
      dob: studentData.dob,
      username,
      account: username,
      password_hash: passwordHash,
      must_change_password: true,
      toan: studentData.scores.toan ?? 0,
      li: studentData.scores.li ?? 0,
      hoa: studentData.scores.hoa ?? 0,
      tieng_anh: studentData.scores.tieng_anh ?? 0,
      van: studentData.scores.van ?? 0,
    })
    .select("id, username")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function updateResultRow(studentId, studentData) {
  const { error } = await supabase
    .from("result")
    .update({
      full_name: studentData.fullName,
      class_name: studentData.className,
      dob: studentData.dob,
      toan: studentData.scores.toan ?? 0,
      li: studentData.scores.li ?? 0,
      hoa: studentData.scores.hoa ?? 0,
      tieng_anh: studentData.scores.tieng_anh ?? 0,
      van: studentData.scores.van ?? 0,
    })
    .eq("id", studentId);

  if (error) {
    throw error;
  }
}

async function upsertStudentWithScores(studentData) {
  const existed = await findResultByFullClass(studentData.fullName, studentData.className);

  if (existed) {
    await updateResultRow(existed.id, studentData);

    return { username: existed.username, existed: true };
  }

  const baseUsername = buildUsername(studentData.fullName);
  const username = await generateUniqueUsername(baseUsername);
  await createResultRow(studentData, username);

  return { username, existed: false };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/import-xlsx.js <path-to-xlsx>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const workbook = XLSX.readFile(resolvedPath);
  if (!workbook.SheetNames.length) {
    throw new Error("XLSX file has no sheets");
  }

  const rawEntries = [];
  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, raw: true });
    for (const row of rows) {
      rawEntries.push(...extractEntriesFromRow(row, sheetName));
    }
  }

  const students = aggregateEntries(rawEntries);
  let imported = 0;
  let skipped = 0;
  let created = 0;
  let updated = 0;

  for (const student of students) {
    if (!student.fullName || !student.className) {
      skipped += 1;
      continue;
    }

    const result = await upsertStudentWithScores(student);
    if (result.existed) {
      updated += 1;
    } else {
      created += 1;
    }
    imported += 1;
  }

  console.log(
    `Import completed: imported=${imported}, created=${created}, updated=${updated}, skipped=${skipped}, raw_entries=${rawEntries.length}, unique_students=${students.length}`
  );

  process.exit(0);
}

main().catch((error) => {
  console.error(`Import failed: ${error.message}`);
  process.exit(1);
});
