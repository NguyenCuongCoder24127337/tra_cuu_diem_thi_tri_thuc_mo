const supabase = require("../../core/supabaseClient");

function getHomeMetadata() {
  return {
    title: "Trang chu - Tra Cuu Diem Thi",
  };
}

async function listStudentsForLookup() {
  const { data, error } = await supabase
    .from("result")
    .select("full_name, username, account, must_change_password")
    .order("full_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

module.exports = {
  getHomeMetadata,
  listStudentsForLookup,
};
