import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('fazendas').select('id, nome, bbox_geojson').order('id', {ascending: false}).limit(1);
  console.log(JSON.stringify(data, null, 2));
  console.log('ERROR:', error);
  process.exit(0);
}
run();
