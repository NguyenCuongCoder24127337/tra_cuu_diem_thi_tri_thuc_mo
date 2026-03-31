const supabase = require("../../core/supabaseClient");

async function findByUsername(username) {
  const { data, error } = await supabase.from("result").select("id").eq("username", username).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function insertStudent({ fullName, className, dob, username, passwordHash }) {
  const { data, error } = await supabase
    .from("result")
    .insert({
      full_name: fullName,
      class_name: className,
      dob: dob || null,
      username,
      account: username,
      password_hash: passwordHash,
      must_change_password: true,
      toan: 0,
      li: 0,
      hoa: 0,
      tieng_anh: 0,
      van: 0,
    })
    .select("id, full_name, class_name, username, account")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

module.exports = {
  findByUsername,
  insertStudent,
};
