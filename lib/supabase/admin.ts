import { createClient } from "@supabase/supabase-js";

// O Admin Client USA a SERVICE_ROLE_KEY que NUNCA deve ser exposta ao Frontend.
// Ele pula as regras de RLS (Row Level Security), permitindo que o motor de 
// processamento em background (ProcessManager, Cron, etc) gerencie as missões livremente.

// Aviso desativado pois usamos Bypass no SQL.

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
