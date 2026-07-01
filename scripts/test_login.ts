import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "lukasmanoel22@gmail.com",
    password: "PraxisDrone2026@"
  });

  if (error) {
    console.error("Login Error:", error.message);
  } else {
    console.log("Login Success!", data.user?.id);
  }
}

testLogin();
