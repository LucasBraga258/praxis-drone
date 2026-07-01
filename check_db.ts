import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1] || "";
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1] || "";

const supabase = createClient(url, key);

supabase.from("mission_jobs").select("*").order("created_at", { ascending: false }).then(console.log);
