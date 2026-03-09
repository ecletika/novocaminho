const { createClient } = require('@supabase/supabase-js');

// OLD LOVABLE DB
const oldUrl = 'https://ixupstbyynqswdehmuna.supabase.co';
const oldAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXBzdGJ5eW5xc3dkZWhtdW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjA4OTQsImV4cCI6MjA4NDU5Njg5NH0.l8p38uFStHjXNtdbfzAd7OSJSUTv1hLR6Uc8SMBZA7I';
const oldDb = createClient(oldUrl, oldAnon);

// NEW DB
const newUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const newAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const newDb = createClient(newUrl, newAnon);

async function migrateTable(tableName) {
    console.log(`\n--- Migrating ${tableName} ---`);

    // Fetch from old
    const { data: oldData, error: oldError } = await oldDb.from(tableName).select('*');
    if (oldError) {
        console.error(`Error fetching old ${tableName}:`, oldError.message);
        return;
    }

    if (!oldData || oldData.length === 0) {
        console.log(`No data found in old ${tableName}. Skipping.`);
        return;
    }

    console.log(`Found ${oldData.length} rows to migrate.`);

    // Optional: clear new table first? Not doing it automatically to be safe, but can do upserts.

    // Insert into new (batching might be needed if lots of rows, but here we assume < 1000)
    const { data: newData, error: newError } = await newDb
        .from(tableName)
        .upsert(oldData, { onConflict: 'id' }) // Use upsert so we can run it multiple times safely
        .select('id');

    if (newError) {
        console.error(`Error inserting into new ${tableName}:`, newError.message);
    } else {
        console.log(`Successfully migrated ${newData.length} rows to ${tableName}.`);
    }
}

async function runFullMigration() {
    console.log('Starting full worship migration from Lovable to New DB...\n');

    // Order of tables matters because of foreign keys!
    // 1. Independent tables
    await migrateTable('worship_functions');
    await migrateTable('worship_ministers');
    await migrateTable('worship_songs');

    // 2. Tables with foreign keys to the ones above
    await migrateTable('worship_members'); // Depends on worship_functions (primary_function_id)
    await migrateTable('song_minister_assignments'); // Depends on songs and ministers

    // 3. Other relational tables
    await migrateTable('member_functions'); // Secondary functions (depends on members and functions)

    console.log('\nMigration process finished!');
}

runFullMigration();
