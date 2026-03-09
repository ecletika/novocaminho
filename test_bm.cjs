const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: bData, error: bError } = await supabase
        .from('birthdays')
        .select('id')
        .limit(1);

    if (!bData || bData.length === 0) return console.log('No birthdays', bError);

    const bId = bData[0].id;

    const { data: mData, error: mError } = await supabase
        .from('ministries')
        .select('id')
        .limit(1);

    if (!mData || mData.length === 0) return console.log('No ministries');

    const mId = mData[0].id;

    const { error: insError } = await supabase
        .from('birthday_ministries')
        .insert({
            birthday_id: bId,
            ministry_id: mId,
            is_leader: false
        });

    console.log('Insert error:', insError ? insError.message : 'Success');

    const { data: checkData } = await supabase
        .from('birthday_ministries')
        .select('*')
        .eq('birthday_id', bId)
        .eq('ministry_id', mId);

    console.log('Check Data:', checkData);
}
run();
