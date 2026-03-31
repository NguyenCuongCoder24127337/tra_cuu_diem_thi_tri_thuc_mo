const supabase = require("../../core/supabaseClient");

async function updatePassword(studentId, passwordHash) {
  const { error } = await supabase
    .from("result")
    .update({
      password_hash: passwordHash,
      must_change_password: false,
    })
    .eq("id", studentId);

  if (error) {
    throw error;
  }
}

module.exports = {
  updatePassword,
};
