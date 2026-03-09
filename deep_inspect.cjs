const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA2MDYwOSwiZXhwIjoyMDg4NjM2NjA5fQ.EVXdgozAEe_zaJG_Y5TEhfqk3PBzPJzjQ2RAsXC7jSk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deepInspect() {
    console.log('--- Deep Inspecting Table Structure ---');

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
        console.log(`\nChecking table: ${table}`);

        // Using a system query to get columns directly from information_schema
        const { data, error } = await supabase.rpc('get_table_columns_v2', { t_name: table });

        if (error) {
            // If RPC doesn't exist, try another system query via a common hack (selecting from a view)
            const { data: cols, error: err2 } = await supabase
                .from('_rpc_helper_internal_cols') // fictitious, but let's try a direct SQL if possible
                .select('*');

            if (err2) {
                console.log(`  RPC failed. Falling back to dummy insert detection...`);
                // Attempt to insert into a non-existent column to see the DB error message which often lists valid columns
                const { error: err3 } = await supabase.from(table).insert({ "_____non_existent_____": "test" });
                if (err3) {
                    console.log(`  DB Error Message: ${err3.message}`);
                    console.log(`  Hint/Detail: ${err3.details || 'No details'}`);
                }
            }
        } else {
            console.log(`  Columns:`, data);
        }
    }
}

deepInspect();
