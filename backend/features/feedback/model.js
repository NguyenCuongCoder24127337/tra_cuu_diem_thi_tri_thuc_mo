const supabase = require("../../core/supabaseClient");

async function insertSuggestion({ fullName, email, phone, title, message }) {
  const { data, error } = await supabase
    .from("thu_gop_y")
    .insert({
      full_name: fullName,
      email,
      phone,
      title,
      message,
      status: "new",
    })
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

async function getSuggestions(status = null) {
  let query = supabase.from("thu_gop_y").select("*");

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

module.exports = {
  insertSuggestion,
  getSuggestions,
};
