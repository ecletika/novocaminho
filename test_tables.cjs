const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('song_minister_assignments')
        .select('*')
        .limit(1);

    console.log('song_minister_assignments:', error ? error.message : 'Success');

    const { data: d2, error: e2 } = await supabase
        .from('worship_schedules')
        .select('*')
        .limit(1);

    console.log('worship_schedules:', e2 ? e2.message : 'Success');
}
run();
