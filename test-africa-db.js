import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key missing in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBucket() {
    console.log("Checking bucket 'africa'...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
        console.error("Error listing buckets:", bucketError);
        return;
    }

    const africaBucket = buckets.find(b => b.id === 'africa');
    if (africaBucket) {
        console.log("Bucket 'africa' exists and is", africaBucket.public ? "public" : "private");
    } else {
        console.log("Bucket 'africa' DOES NOT EXIST.");
    }

    console.log("\nChecking table 'africa_content'...");
    const { data: tableData, error: tableError } = await supabase.from('africa_content').select('count', { count: 'exact', head: true });
    
    if (tableError) {
        console.error("Error checking table:", tableError);
    } else {
        console.log("Table 'africa_content' exists.");
    }
}

testBucket();
