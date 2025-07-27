import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getDefaultLatitude, getDefaultLongitude } from './parserUtils.ts';

interface ScrapedLane {
  name: string;
  type: string;
  wait_time: number;
  vehicle_count: number;
  lines_count: number;
  traffic_flow: string;
  status: string;
}

interface ScrapedCrossing {
  name: string;
  status: string;
  lanes: ScrapedLane[];
}

export async function updateDatabase(
  supabaseClient: any,
  scrapedData: ScrapedCrossing[],
) {
  let crossings_updated = 0;
  let lanes_updated = 0;
  let old_lanes_cleaned = 0;

  for (const scrapedCrossing of scrapedData) {
    try {
      console.log(`📍 Processing crossing: ${scrapedCrossing.name}`);

      // Find or create border crossing - use exact name matching first, then fuzzy
      let { data: existingCrossing, error: findError } = await supabaseClient
        .from('border_crossings')
        .select('id')
        .eq('name', scrapedCrossing.name)
        .single();

      // If exact match fails, try fuzzy matching
      if (!existingCrossing && !findError) {
        const { data: fuzzyCrossing } = await supabaseClient
          .from('border_crossings')
          .select('id')
          .ilike('name', `%${scrapedCrossing.name}%`)
          .single();
        existingCrossing = fuzzyCrossing;
      }

      let crossingId = existingCrossing?.id;

      if (!crossingId) {
        console.log(`🆕 Creating new crossing: ${scrapedCrossing.name}`);

        // Create new crossing if it doesn't exist
        const { data: newCrossing, error: createError } = await supabaseClient
          .from('border_crossings')
          .insert({
            name: scrapedCrossing.name,
            latitude: getDefaultLatitude(scrapedCrossing.name),
            longitude: getDefaultLongitude(scrapedCrossing.name),
            status: scrapedCrossing.status,
            country_from: 'Mexico',
            country_to: 'USA',
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating crossing:', createError);
          throw createError;
        }
        crossingId = newCrossing.id;
        crossings_updated++;
      }

      // Update crossing status and last_updated timestamp
      await supabaseClient
        .from('border_crossings')
        .update({
          status: scrapedCrossing.status,
          last_updated: new Date().toISOString(),
        })
        .eq('id', crossingId);

      console.log(`✅ Updated crossing status for: ${scrapedCrossing.name}`);

      // Batch upsert lanes for better performance
      if (scrapedCrossing.lanes.length > 0) {
        console.log(`🚗 Upserting ${scrapedCrossing.lanes.length} lanes for ${scrapedCrossing.name}`);
        
        const lanesToUpsert = scrapedCrossing.lanes.map(lane => ({
          crossing_id: crossingId,
          name: lane.name,
          type: lane.type,
          status: lane.status,
          wait_time: lane.wait_time,
          vehicle_count: lane.vehicle_count,
          lines_count: lane.lines_count,
          traffic_flow: lane.traffic_flow,
          updated_at: new Date().toISOString(),
        }));

        const { data: upsertResult, error: upsertError } = await supabaseClient
          .from('lanes')
          .upsert(lanesToUpsert, {
            onConflict: 'crossing_id,name',
            ignoreDuplicates: false, // This ensures updates happen
          })
          .select('id');

        if (upsertError) {
          console.error(`❌ Error batch upserting lanes for ${scrapedCrossing.name}:`, upsertError);
        } else {
          const upsertedCount = upsertResult?.length || 0;
          lanes_updated += upsertedCount;
          console.log(`✅ Successfully upserted ${upsertedCount} lanes for ${scrapedCrossing.name}`);
        }
      }
    } catch (error) {
      console.error(
        `❌ Error updating crossing ${scrapedCrossing.name}:`,
        error,
      );
    }
  }

  // Clean up old lane records (older than 1 hour)
  console.log('🧹 Cleaning up old lane records...');
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: deletedCount, error: deleteError } = await supabaseClient
      .from('lanes')
      .delete({ count: 'exact' })
      .lt('updated_at', oneHourAgo);

    if (deleteError) {
      console.error('❌ Error cleaning old lanes:', deleteError);
    } else {
      old_lanes_cleaned = deletedCount || 0;
      console.log(`🗑️ Cleaned up ${old_lanes_cleaned} old lane records`);
    }
  } catch (error) {
    console.error('❌ Error in cleanup process:', error);
  }

  console.log(
    `✅ Database update complete: ${crossings_updated} crossings, ${lanes_updated} lanes updated, ${old_lanes_cleaned} old lanes cleaned`,
  );
  return { crossings_updated, lanes_updated, old_lanes_cleaned };
}