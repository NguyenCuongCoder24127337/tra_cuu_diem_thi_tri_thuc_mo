const supabase = require("../../core/supabaseClient");

async function insertSuggestion({ fullName, className, email, message }) {
  const { data, error } = await supabase
    .from("thu_gop_y")
    .insert({
      full_name: fullName,
      class_name: className,
      email,
      message,
      status: "pending",
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
