const fs = require('fs');
const content = fs.readFileSync('supabase/migrations/20251223140813_remix_migration_from_pg_dump.sql', 'utf8');
const content2 = fs.readFileSync('supabase/migrations/20260206114545_74c9ec23-eaf5-466d-a901-4136fcef0f46.sql', 'utf8');

const tables = [
    'worship_functions',
    'member_functions',
    'worship_members',
    'worship_ministers',
    'worship_songs',
    'song_minister_assignments',
    'worship_schedules',
    'schedule_vocalists',
    'schedule_musicians',
    'schedule_songs',
    'schedule_team_members',
    'schedule_members',
    'general_schedules'
];

let result = `
-- Script to initialize Worship Module tables and permissions
-- Copie TUDO isto e cole no SQL Editor do Supabase, depois carregue em Run.

`;

tables.forEach(table => {
    const createTableRegex = new RegExp(`CREATE TABLE public\.${table} \\(.*?\\);`, 's');
    const match = content.match(createTableRegex);
    if (match) {
        result += match[0].replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS') + '\n\n';

        // Disable RLS just in case, or rather create policy to allow everything
        result += `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n`;
        result += `DROP POLICY IF EXISTS "Enable ALL on ${table}" ON public.${table};\n`;
        result += `CREATE POLICY "Enable ALL on ${table}" ON public.${table} FOR ALL USING (true) WITH CHECK (true);\n\n`;
    }
});

// Also grab user_permissions from content2
const createUP = new RegExp(`CREATE TABLE public\\.user_permissions \\(.*?\\);`, 's');
const matchUP = content2.match(createUP);
if (matchUP) {
    result += matchUP[0].replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS') + '\n\n';
    result += `ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;\n`;
    result += `DROP POLICY IF EXISTS "Enable ALL on user_permissions" ON public.user_permissions;\n`;
    result += `CREATE POLICY "Enable ALL on user_permissions" ON public.user_permissions FOR ALL USING (true) WITH CHECK (true);\n\n`;
}

// Add schema reload just in case
result += `NOTIFY pgrst, 'reload schema';\n`;

fs.writeFileSync('init_louvor.sql', result);
console.log('Saved to init_louvor.sql');
