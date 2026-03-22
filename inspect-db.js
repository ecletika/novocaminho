import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to inspect tables

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("Checking for roles/profiles tables...");
    
    // Check for profiles
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(1);
    if (profilesError) {
        console.log("Table 'profiles' does not exist or error:", profilesError.message);
    } else {
        console.log("Table 'profiles' exists.");
        console.log("Columns:", Object.keys(profiles[0] || {}).join(', '));
    }

    // Check for user_roles (the one I used)
    const { data: userRoles, error: urError } = await supabase.from('user_roles').select('*').limit(1);
    if (urError) {
        console.log("Table 'user_roles' does not exist or error:", urError.message);
    } else {
        console.log("Table 'user_roles' exists.");
    }

    // Check for users in auth.users is hard with anon key, but we have service key
    // Let's just check the current user's data if possible, but this script is service role.
}

inspectSchema();
