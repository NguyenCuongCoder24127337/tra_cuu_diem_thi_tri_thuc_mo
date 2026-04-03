const supabase = require("../../core/supabaseClient");

function getHomeMetadata() {
  return {
    title: "Trang chu - Tra Cuu Diem Thi",
  };
}

async function listStudentsForLookup() {
  const { data, error } = await supabase
    .from("result")
    .select("full_name, username, account")
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
