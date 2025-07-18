import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@env';

const SUPABASE_URL: string = String(NEXT_PUBLIC_SUPABASE_URL || '');
const SUPABASE_ANON_KEY: string = String(NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

console.log('🔍 Initializing Supabase client with environment variables');
console.log('URL:', SUPABASE_URL);
console.log('Key length:', SUPABASE_ANON_KEY.length);

// Add a check to see if keys are actually present
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase URL or Anon Key is missing! Check your .env file and babel.config.js setup.');
}

// Create the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase client created successfully');