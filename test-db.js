import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vpnotookdrjxvemrklad.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA2MDYwOSwiZXhwIjoyMDg4NjM2NjA5fQ.EVXdgozAEe_zaJG_Y5TEhfqk3PBzPJzjQ2RAsXC7jSk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log("Testing site_config upsert...");
  const res1 = await supabase.from('site_config').upsert({ key: 'discipulado_password', value: 'hello', updated_at: new Date().toISOString() }, { onConflict: 'key' });
  console.log("res1:", res1);

  console.log("Testing discipleship_sessions insert...");
  const res2 = await supabase.from('discipleship_sessions').insert({
    person_name: 'Test',
    session_date: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000000',
    answers: {},
    ratings: {}
  });
  console.log("res2:", res2);
}

test();
