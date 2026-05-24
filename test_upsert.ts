import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import "https://deno.land/std@0.168.0/dotenv/load.ts";

const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || process.env.VITE_SUPABASE_URL;
const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('governance_settings')
    .upsert({ 
      id: 'current',
      min_contribution_confirmations: 5
    })
    .select();
  console.log(data, error);
}
run();
