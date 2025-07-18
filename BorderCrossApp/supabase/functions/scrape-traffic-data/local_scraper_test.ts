import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

// Re-import necessary functions from parserUtils.ts
// In a real Deno environment, you'd import these directly.
// For this local test, we'll include them here for self-containment.

function parseWaitTime(waitStr: string): number {
  if (!waitStr || waitStr === 'N/A') return 0;

  const hourMinPattern = /(\d+):(\d+)\s*hrs?/i;
  const hourMatch = waitStr.match(hourMinPattern);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60 + parseInt(hourMatch[2], 10);
  }

  const minPattern = /(\d+)\s*mins?/i;
  const minMatch = waitStr.match(minPattern);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  return 0;
}

function normalizeGaritaName(name: string): string {
  const nameMap: { [key: string]: string } = {
    'Garita de San Ysidro': 'San Ysidro',
    'San Ysidro PedWest': 'San Ysidro PedWest',
    'Garita de Otay': 'Otay Mesa',
    'Garita de Otay Comercial': 'Otay Comercial',
  };

  return nameMap[name] || name.replace(/^Garita de /, '');
}

function determineTrafficFlow(waitTime: number): string {
  if (waitTime < 20) return 'fast';
  if (waitTime > 60) return 'slow';
  return 'moderate';
}

function calculateVehicleCount(
  linesCount: number,
  waitTime: number,
  laneName: string,
): number {
  if (linesCount === 0 || waitTime === 0) return 0;

  const isPedestrian =
    laneName.toLowerCase().includes('peatonal') ||
    laneName.toLowerCase().includes('pedestrian');

  if (isPedestrian) {
    const peoplePerLine = Math.floor(waitTime / 2);
    return linesCount * Math.max(peoplePerLine, 5);
  } else {
    const vehiclesPerLine = Math.floor(waitTime / 3);
    return linesCount * Math.max(vehiclesPerLine, 3);
  }
}

function getFormattedLaneName(laneBaseName: string, laneType: string): string {
  const lowerBaseName = laneBaseName.toLowerCase();

  if (laneType === 'pedestrian') {
    if (lowerBaseName.includes('ready')) return 'Peatonal Ready Lane';
    if (lowerBaseName.includes('sentry')) return 'Peatonal Sentry';
    return 'Peatonal Normal';
  }

  if (lowerBaseName.includes('normal')) return 'Normal';
  if (lowerBaseName.includes('ready')) return 'Ready Lane';
  if (lowerBaseName.includes('sentry')) return 'Sentry';
  if (lowerBaseName.includes('fast')) return 'Fast Lane';

  return laneBaseName;
}

function parseLinesCount(linesStr: string): number {
  const match = linesStr.match(/(\d+)\s*l/);
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

async function parseTrafficDataDOM(html: string): Promise<ScrapedCrossing[]> {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) {
    console.error('Failed to parse HTML document.');
    return [];
  }

  const crossings: ScrapedCrossing[] = [];
  const garitaSections = doc.querySelectorAll('.row.garitas');

  for (const section of garitaSections) {
    const garitaNameElement = section.querySelector('h2');
    if (!garitaNameElement) continue;

    const garitaName = normalizeGaritaName(garitaNameElement.textContent?.trim() || '');
    const lanes: ScrapedLane[] = [];

    const laneElements = section.querySelectorAll('.column-inner');
    for (const laneEl of laneElements) {
      const laneHeader = laneEl.querySelector('.garitas-header');
      const delaySpan = laneEl.querySelector('.delay');
      const linesOpenSpan = laneEl.querySelector('.lanes-open');
      const materialIcon = laneEl.querySelector('.material-icons');

      if (!laneHeader || !delaySpan || !linesOpenSpan || !materialIcon) continue;

      let laneBaseName = laneHeader.textContent?.trim() || '';
      const waitTimeStr = delaySpan.textContent?.trim() || '';
      const linesOpenStr = linesOpenSpan.textContent?.trim() || '';
      const iconType = materialIcon.textContent?.trim() || '';

      const waitTime = parseWaitTime(waitTimeStr);
      const linesCount = parseLinesCount(linesOpenStr);
      const laneType = determineLaneTypeFromIcon(iconType);

      const laneName = getFormattedLaneName(laneBaseName, laneType);

      const estimatedVehicleCount = calculateVehicleCount(
        linesCount,
        waitTime,
        laneName,
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
        status: 'open',
        lanes,
      });
    }
  }

  return crossings;
}

// Main execution for local test
(async () => {
  console.log('Starting local scraper test...');
  try {
    const response = await fetch('https://traficogaritas.com/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML fetched successfully.');

    const scrapedData = await parseTrafficDataDOM(html);
    console.log('--- Scraped Data Output ---');
    console.log(JSON.stringify(scrapedData, null, 2));
    console.log('--- End Scraped Data Output ---');

  } catch (error) {
    console.error('Local scraper test failed:', error);
  }
})();
