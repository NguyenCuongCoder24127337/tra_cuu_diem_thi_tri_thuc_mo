const supabase = require("../../core/supabaseClient");

async function findByField(field, operator, value) {
  const { data, error } = await supabase
    .from("result")
    .select("id, full_name, class_name, dob, username, account, password_hash, must_change_password")
    [operator](field, value)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function findStudentByAccountOrUsername(accountOrUsername) {
  const value = String(accountOrUsername || "").trim();
  if (!value) {
    return null;
  }

  // Try exact match first, then fallback to case-insensitive match.
  const exactAccount = await findByField("account", "eq", value);
  if (exactAccount) {
    return exactAccount;
  }

  const exactUsername = await findByField("username", "eq", value);
  if (exactUsername) {
    return exactUsername;
  }

  const ciAccount = await findByField("account", "ilike", value);
  if (ciAccount) {
    return ciAccount;
  }

  return findByField("username", "ilike", value);
}

module.exports = {
  findStudentByAccountOrUsername,
};
