import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, errorResponse } from '../_shared/utils.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import { sendUpdateNotification } from '../_shared/notificationUtils.ts';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('⏰ Cron job triggered: Updating wait times...');

    const supabaseClient = getSupabaseClient();

    // Get environment variables
    const serviceKey = Deno.env.get('SB_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');

    console.log('🔑 Service key available:', serviceKey ? 'Yes' : 'No');
    console.log('🌐 Supabase URL:', supabaseUrl ? 'Yes' : 'No');

    if (!serviceKey) {
      throw new Error('SB_SERVICE_ROLE_KEY not found in environment');
    }

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in environment');
    }

    // Call the scraping function with proper authentication
    const scrapeResponse = await fetch(
      `${supabaseUrl}/functions/v1/scrape-traffic-data`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          apikey: serviceKey,
        },
        body: JSON.stringify({ source: 'cron' }),
      },
    );

    console.log('📡 Scrape response status:', scrapeResponse.status);

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('❌ Scrape response error:', errorText);
      throw new Error(
        `Scraping failed with status ${scrapeResponse.status}: ${errorText}`,
      );
    }

    const scrapeResult = await scrapeResponse.json();
    console.log('📊 Scrape result:', scrapeResult);

    if (!scrapeResult.success) {
      throw new Error(`Scraping failed: ${scrapeResult.error}`);
    }

    console.log('✅ Wait times updated successfully');
    console.log(
      `📊 Updated: ${scrapeResult.crossings_updated} crossings, ${scrapeResult.lanes_updated} lanes`,
    );

    // Optional: Send notification about successful update
    if (scrapeResult.lanes_updated > 0) {
      await sendUpdateNotification(supabaseClient, scrapeResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Wait times updated successfully via cron job',
        ...scrapeResult,
        cron_timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return errorResponse(error.message, 500);
  }
});