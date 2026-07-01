import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://oxpgvddyfmistabmyxxe.supabase.co";
const supabaseKey = "sb_publishable_x_EBdc2bj7ACEF6co2fJ9w_saAbHiiG";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfigTable() {
  const { error } = await supabase.from("configuracoes").select("*").limit(1);
  console.log("Error querying configuracoes:", error);
}
checkConfigTable();
