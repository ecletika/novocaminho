
import { createClient } from '@supabase/supabase-js';

const BIBLE_SUPABASE_URL = 'https://ixupstbyynqswdehmuna.supabase.co';
const BIBLE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXBzdGJ5eW5xc3dkZWhtdW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjA4OTQsImV4cCI6MjA4NDU5Njg5NH0.l8p38uFStHjXNtdbfzAd7OSJSUTv1hLR6Uc8SMBZA7I';

// Separate client for Bible database
export const bibleSupabase = createClient(BIBLE_SUPABASE_URL, BIBLE_SUPABASE_ANON_KEY);
