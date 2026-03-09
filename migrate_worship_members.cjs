const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vpnotookdrjxvemrklad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // 1. Fetch worship members
    const { data: members, error: mError } = await supabase
        .from('worship_members')
        .select('*');

    if (mError) {
        console.error('Error fetching worship_members:', mError);
        return;
    }

    console.log(`Found ${members.length} worship members.`);

    // 2. Fetch the 'Ministério de Louvor' ID
    const { data: ministries, error: minError } = await supabase
        .from('ministries')
        .select('id, title')
        .ilike('title', '%Louvor%');

    if (minError || !ministries || ministries.length === 0) {
        console.error('Could not find worship ministry:', minError);
        return;
    }

    const worshipMinistryId = ministries[0].id;
    console.log(`Worship Ministry ID: ${worshipMinistryId} (${ministries[0].title})`);

    let migratedCount = 0;

    // 3. Migrate each member
    for (const member of members) {
        // Check if a birthday entry already exists for this person (by name)
        const { data: existing } = await supabase
            .from('birthdays')
            .select('id, woman_name, man_name')
            .or(`woman_name.ilike.%${member.name}%,man_name.ilike.%${member.name}%`)
            .limit(1);

        let birthdayId;

        if (existing && existing.length > 0) {
            birthdayId = existing[0].id;
            console.log(`Member ${member.name} already exists in birthdays. Linking...`);
        } else {
            // Create new birthday entry
            const { data: newBirthday, error: bError } = await supabase
                .from('birthdays')
                .insert({
                    woman_name: member.name,
                    birthday_type: 'personal',
                    birthday_date: '2000-01-01', // Default date since we don't have it
                    phone: member.phone,
                    photo_url: member.photo_url
                })
                .select()
                .single();

            if (bError) {
                console.error(`Error creating birthday for ${member.name}:`, bError);
                continue;
            }
            birthdayId = newBirthday.id;
            console.log(`Created new birthday entry for ${member.name}.`);
        }

        // Link to ministry
        // Check if link already exists
        const { data: existingLink } = await supabase
            .from('birthday_ministries')
            .select('*')
            .eq('birthday_id', birthdayId)
            .eq('ministry_id', worshipMinistryId);

        if (!existingLink || existingLink.length === 0) {
            const { error: linkError } = await supabase
                .from('birthday_ministries')
                .insert({
                    birthday_id: birthdayId,
                    ministry_id: worshipMinistryId,
                    is_leader: false
                });

            if (linkError) {
                console.error(`Error linking ${member.name} to ministry:`, linkError);
            } else {
                migratedCount++;
            }
        } else {
            console.log(`Member ${member.name} was already linked to the ministry.`);
        }
    }

    console.log(`Migration complete. Successfully migrated/linked ${migratedCount} members.`);
}

run();
