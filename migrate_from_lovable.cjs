const { createClient } = require('@supabase/supabase-js');

// OLD LOVABLE DB
const oldUrl = 'https://ixupstbyynqswdehmuna.supabase.co';
const oldAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXBzdGJ5eW5xc3dkZWhtdW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjA4OTQsImV4cCI6MjA4NDU5Njg5NH0.l8p38uFStHjXNtdbfzAd7OSJSUTv1hLR6Uc8SMBZA7I';
const oldDb = createClient(oldUrl, oldAnon);

// NEW DB
const newUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const newAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const newDb = createClient(newUrl, newAnon);

async function run() {
    console.log('Fetching from OLD DB...');
    const { data: members, error: mError } = await oldDb
        .from('worship_members')
        .select('*');

    if (mError) {
        console.error('Error fetching old worship_members:', mError);
        return;
    }

    console.log(`Found ${members.length} members in old Lovable project.`);

    if (members.length === 0) return;

    console.log('Fetching Worship Ministry ID from NEW DB...');
    const { data: ministries, error: minError } = await newDb
        .from('ministries')
        .select('id, title')
        .ilike('title', '%Louvor%');

    if (minError || !ministries || ministries.length === 0) {
        console.error('Could not find worship ministry in NEW DB:', minError);
        return;
    }

    const worshipMinistryId = ministries[0].id;
    console.log(`Worship Ministry ID: ${worshipMinistryId} (${ministries[0].title})`);

    let migratedCount = 0;

    for (const member of members) {
        console.log(`Processing ${member.name}...`);

        // Check if a birthday entry exists in NEW DB
        const { data: existing } = await newDb
            .from('birthdays')
            .select('id, woman_name, man_name')
            .or(`woman_name.ilike.%${member.name}%,man_name.ilike.%${member.name}%`)
            .limit(1);

        let birthdayId;

        if (existing && existing.length > 0) {
            birthdayId = existing[0].id;
            console.log(`  -> EXISTS. Linking...`);
        } else {
            // Create new birthday entry in NEW DB
            // Use their creation date from old db if possible, but for birthday date we need a dummy if unknown
            const { data: newBirthday, error: bError } = await newDb
                .from('birthdays')
                .insert({
                    woman_name: member.name,
                    birthday_type: 'personal',
                    birthday_date: '2000-01-01', // Default
                    phone: member.phone,
                    photo_url: member.photo_url
                })
                .select()
                .single();

            if (bError) {
                console.error(`  -> ERROR creating birthday:`, bError);
                continue;
            }
            birthdayId = newBirthday.id;
            console.log(`  -> CREATED new birthday (ID: ${birthdayId}).`);
        }

        // Link to ministry in NEW DB
        const { data: existingLink } = await newDb
            .from('birthday_ministries')
            .select('*')
            .eq('birthday_id', birthdayId)
            .eq('ministry_id', worshipMinistryId);

        if (!existingLink || existingLink.length === 0) {
            const { error: linkError } = await newDb
                .from('birthday_ministries')
                .insert({
                    birthday_id: birthdayId,
                    ministry_id: worshipMinistryId,
                    is_leader: false
                });

            if (linkError) {
                console.error(`  -> ERROR linking:`, linkError);
            } else {
                console.log(`  -> LINKED to ministry successfully.`);
                migratedCount++;
            }
        } else {
            console.log(`  -> WAS ALREADY LINKED to ministry.`);
        }
    }

    console.log(`Migration complete. Successfully migrated/linked ${migratedCount} members.`);
}

run();
