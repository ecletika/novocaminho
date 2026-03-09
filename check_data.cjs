const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA2MDYwOSwiZXhwIjoyMDg4NjM2NjA5fQ.EVXdgozAEe_zaJG_Y5TEhfqk3PBzPJzjQ2RAsXC7jSk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAll() {
    console.log('--- Listing Rows in Tables ---');

    const tables = [
        'worship_functions',
        'worship_members',
        'worship_ministers',
        'worship_songs',
        'song_minister_assignments',
        'worship_schedules',
        'member_functions'
    ];

    for (const table of tables) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' });

        if (error) {
            console.log(`Table ${table}: ERROR - ${error.message}`);
        } else {
            console.log(`Table ${table}: ${data.length} rows (Count: ${count})`);
            if (data.length > 0) {
                console.log(`  Sample keys: ${Object.keys(data[0]).join(', ')}`);
            }
        }
    }
}

listAll();
