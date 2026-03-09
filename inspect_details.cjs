const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA2MDYwOSwiZXhwIjoyMDg4NjM2NjA5fQ.EVXdgozAEe_zaJG_Y5TEhfqk3PBzPJzjQ2RAsXC7jSk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDetails() {
    // Test if we can see the full columns if we fail an insert
    console.log('Detecting columns for worship_functions...');
    // Attempt to insert a junk field to trigger error that lists valid columns
    const { error } = await supabase.from('worship_functions').insert({ junk_field_detection: 'test' });
    if (error) {
        console.log('Error triggered (expected):', error.message);
    }
}

checkDetails();
