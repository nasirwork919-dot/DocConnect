import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zonoufwagtlbwvpaksuf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvbm91ZndhZ3RsYnd2cGFrc3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDc1NjUsImV4cCI6MjA5NjkyMzU2NX0.jvk537eO58M9U-AZGuHH11xoox7huWe3jWjR5DcwCUE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);