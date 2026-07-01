import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getPolicies() {
  const { data, error } = await supabase
    .rpc("get_policies", {}); // Doesn't exist, we must use a raw query if we have an API for it. We don't.
}
