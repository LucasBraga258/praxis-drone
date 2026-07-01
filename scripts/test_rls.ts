import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testInsert() {
  // 1. Logar como o admin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "lukasmanoel22@gmail.com",
    password: "PraxisDrone2026@"
  });

  if (authError) {
    console.error("Erro no login:", authError.message);
    return;
  }
  
  console.log("Logado como:", authData.user?.id);

  // 2. Verificar o perfil
  const { data: perfilData } = await supabase
    .from("perfis_usuarios")
    .select("*")
    .eq("id", authData.user?.id)
    .single();
    
  console.log("Perfil no banco:", perfilData);

  // 3. Tentar inserir na tabela clientes
  const { data: insertData, error: insertError } = await supabase
    .from("clientes")
    .insert([{ nome: "Teste RLS", email: "teste@rls.com" }])
    .select();

  if (insertError) {
    console.error("Erro no INSERT:", insertError.message);
  } else {
    console.log("Sucesso no INSERT:", insertData);
  }
}

testInsert();
