import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // Try inserting as anon
    const { data, error } = await supabase
        .from('birthdays')
        .insert({
            birthday_date: "2000-01-01",
            birthday_type: "personal",
            woman_name: "Test Anon"
        })
        .select();

    console.log('Anon Insert error:', error ? error.message : 'Success');

    // Try inserting as an authenticated user.
    // We need to login first. Let's use the owner credentials if possible, 
    // but we don't know the password.
    // Is there any edge function with service key?
}
run();
