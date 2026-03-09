const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { error } = await supabase
        .from('worship_members')
        .select('id')
        .limit(1);

    if (error) {
        console.log('worship_members:', error.message, error.code);
    } else {
        console.log('worship_members: Table exists and is readable.');
    }
}

run();
