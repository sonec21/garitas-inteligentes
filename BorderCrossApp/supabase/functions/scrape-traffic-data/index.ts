import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';
import { corsHeaders, errorResponse } from '../_shared/utils.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';
import {
  parseWaitTime,
  normalizeGaritaName,
  determineTrafficFlow,
  calculateVehicleCount,
} from '../_shared/parserUtils.ts';
import { updateDatabase } from '../_shared/databaseUtils.ts';

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

const SCRAPE_URLS = [
  'https://traficogaritas.com/', // Tijuana
  'https://garitastrafico.com/garitas-reporte-mexicali-calexico/', // Mexicali/Calexico
  'https://traficogaritas.com/tecate/', // Tecate
];

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🕷️ Starting traffic data scraping...');

    const supabaseClient = getSupabaseClient();

    let allScrapedData: ScrapedCrossing[] = [];

    // Check if test data is provided
    const requestBody = await req.json().catch(() => ({}));

    if (requestBody.testData) {
      console.log('🧪 Using provided test data instead of scraping...');
      allScrapedData = requestBody.testData;
      console.log(`📊 Processed ${allScrapedData.length} test border crossings`);
    } else {
      for (const url of SCRAPE_URLS) {
        console.log(`📡 Fetching ${url}...`);
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        if (!response.ok) {
          console.warn(`⚠️ HTTP error fetching ${url}: ${response.status}`);
          continue; // Continue to next URL even if one fails
        }

        const html = await response.text();
        console.log(`✅ Website fetched successfully from ${url}`);

        console.log(`🔍 Parsing traffic data from ${url}...`);
        const scrapedDataForUrl = await parseTrafficDataDOM(html);
        allScrapedData.push(...scrapedDataForUrl);
        console.log(`📊 Parsed ${scrapedDataForUrl.length} border crossings from ${url}`);
      }
    }

    // Update database
    console.log('💾 Updating database...');
    const updateResults = await updateDatabase(supabaseClient, allScrapedData);

    console.log('✅ Scraping completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Traffic data scraped and updated successfully',
        crossings_updated: updateResults.crossings_updated,
        lanes_updated: updateResults.lanes_updated,
        old_lanes_cleaned: updateResults.old_lanes_cleaned,
        total_crossings_processed: allScrapedData.length,
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
    console.error('❌ Scraping error:', error);
    return errorResponse(error.message, 500);
  }
});

async function parseTrafficDataDOM(html: string): Promise<ScrapedCrossing[]> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) {
    console.error('Failed to parse HTML document.');
    return [];
  }

  const crossings: ScrapedCrossing[] = [];
  const garitaSections = doc.querySelectorAll('.row.garitas');

  for (const section of garitaSections) {
    // Try to find garita name in h2 or h3
    const garitaNameElement = section.querySelector('h2') || section.querySelector('h3');
    if (!garitaNameElement) continue;

    const garitaName = normalizeGaritaName(garitaNameElement.textContent?.trim() || '');
    const lanes: ScrapedLane[] = [];

    const laneElements = section.querySelectorAll('.column-inner');
    for (const laneEl of laneElements) {
      // Try to find lane header in h3 or h4
      const laneHeader = laneEl.querySelector('.garitas-header') || laneEl.querySelector('h4') || laneEl.querySelector('h3');
      const delaySpan = laneEl.querySelector('.delay');
      const linesOpenSpan = laneEl.querySelector('.lanes-open');
      const materialIcon = laneEl.querySelector('.material-icons');

      if (!laneHeader || !delaySpan || !linesOpenSpan || !materialIcon) continue;

      let laneBaseName = laneHeader.textContent?.trim() || '';
      const waitTimeStr = delaySpan.textContent?.trim() || '';
      const linesOpenStr = linesOpenSpan.textContent?.trim() || '';
      const iconType = materialIcon.textContent?.trim() || ''; // 'directions_car' or 'directions_walk'

      const waitTime = parseWaitTime(waitTimeStr);
      const linesCount = parseLinesCount(linesOpenStr);
      const laneType = determineLaneTypeFromIcon(iconType);

      // Create a more specific lane name using the new helper
      const laneName = getFormattedLaneName(laneBaseName, laneType);

      const estimatedVehicleCount = calculateVehicleCount(
        linesCount,
        waitTime,
        laneName, // Use the more specific laneName for calculation
      );

      lanes.push({
        name: laneName,
        type: laneType,
        wait_time: waitTime,
        vehicle_count: estimatedVehicleCount,
        lines_count: linesCount,
        traffic_flow: determineTrafficFlow(waitTime),
        status: waitTimeStr.toLowerCase().includes('n/a') ? 'closed' : 'open',
      });
    }

    if (lanes.length > 0) {
      crossings.push({
        name: garitaName,
        status: 'open', // Assuming if lanes are found, crossing is open
        lanes,
      });
    }
  }

  return crossings;
}

function getFormattedLaneName(laneBaseName: string, laneType: string): string {
  const lowerBaseName = laneBaseName.toLowerCase();

  // Handle pedestrian lanes first
  if (laneType === 'pedestrian') {
    if (lowerBaseName.includes('ready')) return 'Peatonal Ready Lane';
    if (lowerBaseName.includes('sentry')) return 'Peatonal Sentry';
    // Default for pedestrian if not ready/sentry, check for 'standard' or 'normal'
    if (lowerBaseName.includes('standard') || lowerBaseName.includes('normal')) return 'Peatonal Normal';
    return 'Peatonal Normal'; // Fallback for pedestrian
  }

  // Handle vehicle/commercial lanes
  if (lowerBaseName.includes('normal') || lowerBaseName.includes('standard')) return 'Normal';
  if (lowerBaseName.includes('ready')) return 'Ready Lane';
  if (lowerBaseName.includes('sentry')) return 'Sentry';
  if (lowerBaseName.includes('fast')) return 'Fast Lane';

  return laneBaseName; // Fallback, should ideally not be reached for known types
}

function parseLinesCount(linesStr: string): number {
  const match = linesStr.match(/(\d+)\s*l/); // e.g., "6 líneas abiertas"
  return match ? parseInt(match[1], 10) : 0;
}

function determineLaneTypeFromIcon(icon: string): string {
  if (icon.includes('directions_car') || icon.includes('local_shipping')) {
    return 'vehicle';
  }
  if (icon.includes('directions_walk')) {
    return 'pedestrian';
  }
  return 'unknown';
}
