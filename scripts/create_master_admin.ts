import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function criarAdminMaster() {
  console.log("Criando usuário master...");
  const { data, error } = await supabase.auth.signUp({
    email: "lukasmanoel22@gmail.com",
    password: "PraxisDrone2026@",
    options: {
      data: {
        nome: "Lukas Manoel",
        perfil: "admin",
        status: "aprovado"
      }
    }
  });

  if (error) {
    console.error("Erro ao criar usuário:", error.message);
  } else {
    console.log("✅ Usuário Master criado com sucesso!");
    console.log("ID do Usuário:", data.user?.id);
    
    // Se o banco não tiver o trigger com raw_user_meta_data, podemos tentar atualizar:
    const { error: updateError } = await supabase
      .from("perfis_usuarios")
      .update({ perfil: "admin", status: "aprovado" })
      .eq("id", data.user?.id);
      
    if (updateError) {
      console.log("⚠️ Nota: Você precisa rodar os scripts SQL no Supabase para aplicar a tabela de perfis_usuarios e o status!");
    } else {
      console.log("✅ Perfil Admin configurado com sucesso no banco de dados!");
    }
  }
}

criarAdminMaster();
