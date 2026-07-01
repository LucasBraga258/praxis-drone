import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fixProfile() {
  const { error } = await supabase
    .from("perfis_usuarios")
    .update({ status: "aprovado", perfil: "admin" })
    .eq("email", "lukasmanoel22@gmail.com");

  if (error) {
    console.error("Erro ao atualizar perfil (ANON KEY pode não ter permissão):", error.message);
  } else {
    console.log("Perfil atualizado para APROVADO via API Anon!");
  }
}

fixProfile();
