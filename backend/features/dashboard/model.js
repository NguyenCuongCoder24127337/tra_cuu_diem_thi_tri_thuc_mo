const supabase = require("../../core/supabaseClient");

const subjects = ["toan", "li", "hoa", "tieng_anh", "van"];
const subjectLabels = {
  toan: "Toán",
  li: "Lý",
  hoa: "Hóa",
  tieng_anh: "Tiếng Anh",
  van: "Văn",
};

function normalizeScores(rawRow) {
  const result = {};

  for (const subject of subjects) {
    const value = rawRow?.[subject];
    result[subject] = typeof value === "number" ? value : Number(value || 0);
  }

  return result;
}

async function findStudentScores(studentId) {
  const { data, error } = await supabase
    .from("result")
    .select("toan, li, hoa, tieng_anh, van")
    .eq("id", studentId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return normalizeScores(data);
}

async function findAllStudentsWithScores() {
  const { data, error } = await supabase.from("result").select("full_name, class_name, toan, li, hoa, tieng_anh, van");

  if (error) {
    throw error;
  }

  return (data || []).map((row) => ({
    fullName: row.full_name,
    className: row.class_name,
    scores: normalizeScores(row),
  }));
}

module.exports = {
  subjects,
  subjectLabels,
  findStudentScores,
  findAllStudentsWithScores,
};
