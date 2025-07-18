import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/utils.ts'; // Import corsHeaders

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('SB_ANON_KEY') ?? '',
    );

    const { crossing_id } = await req.json();

    // Get border crossing data with lanes
    const { data: crossings, error } = await supabaseClient
      .from('border_crossings')
      .select(
        `
        *,
        lanes (
          *,
          accidents (*)
        )
      `,
      )
      .eq(crossing_id ? 'id' : 'status', crossing_id || 'open');

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        data: crossings,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
});