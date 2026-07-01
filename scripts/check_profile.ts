import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkProfile() {
  const { data, error } = await supabase
    .from("perfis_usuarios")
    .select("*")
    .eq("email", "lukasmanoel22@gmail.com");

  if (error) {
    console.error("Erro:", error.message);
  } else {
    console.log("Perfil:", data);
  }
}

checkProfile();
