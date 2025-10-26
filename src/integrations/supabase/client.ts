import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xrdbgkiorhucmebifuym.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZGJna2lvcmh1Y21lYmlmdXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTkyMzAsImV4cCI6MjA3NzAzNTIzMH0.Qglr21uo_KtqgwOCwj4xdUZQNI3FWOLCoTnztuR70KA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);