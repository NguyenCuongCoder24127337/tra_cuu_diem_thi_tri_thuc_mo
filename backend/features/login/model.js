const supabase = require("../../core/supabaseClient");

async function findStudentByAccountOrUsername(accountOrUsername) {
  const { data, error } = await supabase
    .from("result")
    .select("id, full_name, class_name, dob, username, account, password_hash, must_change_password")
    .or(`account.eq.${accountOrUsername},username.eq.${accountOrUsername}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

module.exports = {
  findStudentByAccountOrUsername,
};
