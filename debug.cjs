const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: bData, error: bError } = await supabase
        .from('birthdays')
        .select('*, ministries:birthday_ministries(*)')
        .limit(10);

    console.log('Birthdays with ministries:', bData ? bData.length : bError);

    if (bData && bData.length > 0) {
        const b = bData[0];
        console.log('First birthday:', b.id, 'ministries:', b.ministries);
    }

}
run();
