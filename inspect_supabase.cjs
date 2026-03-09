const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA2MDYwOSwiZXhwIjoyMDg4NjM2NjA5fQ.EVXdgozAEe_zaJG_Y5TEhfqk3PBzPJzjQ2RAsXC7jSk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
    console.log('--- Inspecting Supabase Schema ---');

    const tables = [
        'worship_functions',
        'worship_members',
        'worship_ministers',
        'worship_songs',
        'song_minister_assignments',
        'worship_schedules',
        'user_permissions'
    ];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);

        // We can use a trick to get column names by selecting 0 rows
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(0);

        if (error) {
            console.error(`  Error: ${error.message}`);
        } else {
            // In JS client, we can't easily see schema without actual data or specific RPC
            // But we can try to insert a dummy and see what fails, or use a direct SQL query via RPC if available.
            // Since I don't know if RPC 'inspect' exists, I'll try to fetch one row if exists
            const { data: rows } = await supabase.from(table).select('*').limit(1);
            if (rows && rows.length > 0) {
                console.log(`  Columns found: ${Object.keys(rows[0]).join(', ')}`);
            } else {
                console.log('  Table is empty, cannot detect columns via select.');
            }
        }
    }
}

inspectSchema();
