import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for now since @env is not working
const SUPABASE_URL = 'https://tcvilrjnpiaphhzluawr.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

console.log('🔧 Using hardcoded Supabase configuration');
console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('🔑 Supabase key length:', SUPABASE_ANON_KEY.length);

// Create the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('✅ Supabase client created successfully');

// Test the connection
supabase.from('border_crossings').select('id').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection test successful');
    }
  })
  .catch(err => {
    console.error('❌ Supabase connection test error:', err);
  });