import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function getSupabaseClient() {
  return createClient(
    Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
    Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '',
  );
}