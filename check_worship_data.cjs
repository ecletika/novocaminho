const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://vpnotookdrjxvemrklad.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
    try {
        console.log('--- Checking RLS Policies ---');
        // Unfortunately, we can't query pg_policies with anon key.
        // But we can check if we can actually READ and WRITE to the tables.

        const { data: m, error: mE } = await supabase.from('worship_members').select('id').limit(1);
        console.log('Read worship_members:', mE ? 'FAILED: ' + mE.message : 'SUCCESS');

        const { data: f, error: fE } = await supabase.from('worship_functions').select('id').limit(1);
        console.log('Read worship_functions:', fE ? 'FAILED: ' + fE.message : 'SUCCESS');

    } catch (err) {
        console.error(err);
    }
}

checkRLSPolicies();
