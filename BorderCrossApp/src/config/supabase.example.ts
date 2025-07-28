import { createClient } from '@supabase/supabase-js';

// Copy this file to supabase.ts and update with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseServiceRoleKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';