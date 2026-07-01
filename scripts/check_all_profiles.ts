import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkProfiles() {
  const { data, error } = await supabase
    .from("perfis_usuarios")
    .select("*");

  if (error) {
    console.error("Erro:", error.message);
  } else {
    console.log("Perfis:", data);
  }
}

checkProfiles();
