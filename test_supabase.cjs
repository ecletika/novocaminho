const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    let res = await supabase.from('birthdays').select('*, ministries:birthday_ministries(ministry_id, is_leader)').limit(1);
    console.log('Test 1 error:', res.error ? res.error.message : 'Success');

    res = await supabase.from('birthdays').select('*, birthday_ministries(ministry_id, is_leader)').limit(1);
    console.log('Test 2 error:', res.error ? res.error.message : 'Success');

    res = await supabase.from('birthdays').select('*, birthday_ministries!inner(ministry_id, is_leader)').limit(1);
    console.log('Test 3 error:', res.error ? res.error.message : 'Success');
}
run();
