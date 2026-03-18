const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

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
