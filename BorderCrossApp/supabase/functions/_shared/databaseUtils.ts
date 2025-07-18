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

      // Update crossing status
      await supabaseClient
        .from('border_crossings')
        .update({
          status: scrapedCrossing.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', crossingId);

      // Clean up old lanes that no longer exist
      if (scrapedCrossing.lanes.length > 0) {
        const currentLaneNames = scrapedCrossing.lanes.map(l => l.name);
        const { data: existingLanes } = await supabaseClient
          .from('lanes')
          .select('name')
          .eq('crossing_id', crossingId);

        if (existingLanes) {
          const lanesToDelete = existingLanes
            .filter(lane => !currentLaneNames.includes(lane.name))
            .map(lane => lane.name);

          if (lanesToDelete.length > 0) {
            for (const laneName of lanesToDelete) {
              await supabaseClient
                .from('lanes')
                .delete()
                .eq('crossing_id', crossingId)
                .eq('name', laneName);
            }
            console.log(`🗑️ Deleted ${lanesToDelete.length} old lanes`);
          }
        }
      }

      // Upsert current lanes
      for (const lane of scrapedCrossing.lanes) {
        console.log(
          `🚗 Updating lane: ${lane.name} - ${lane.wait_time}min wait`,
        );

        const { error: upsertError } = await supabaseClient
          .from('lanes')
          .upsert(
            {
              crossing_id: crossingId,
              name: lane.name,
              type: lane.type,
              status: lane.status,
              wait_time: lane.wait_time,
              vehicle_count: lane.vehicle_count,
              lines_count: lane.lines_count,
              traffic_flow: lane.traffic_flow,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'crossing_id,name',
            },
          );

        if (upsertError) {
          console.warn(`⚠️ Error upserting lane ${lane.name}:`, upsertError);
        } else {
          lanes_updated++;
        }
      }
    } catch (error) {
      console.error(
        `❌ Error updating crossing ${scrapedCrossing.name}:`,
        error,
      );
    }
  }

  console.log(
    `✅ Database update complete: ${crossings_updated} crossings, ${lanes_updated} lanes updated`,
  );
  return { crossings_updated, lanes_updated };
}