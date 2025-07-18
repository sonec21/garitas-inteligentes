// Specific parser for traficogaritas.com
export interface TrafficData {
  crossing: string;
  lanes: {
    name: string;
    type: string;
    waitTime: number;
    status: string;
    lastUpdated: string;
  }[];
}

export async function parseTraficoGaritas(
  html: string,
): Promise<TrafficData[]> {
  console.log('🔍 Parsing traficogaritas.com specific structure...');

  const crossings: TrafficData[] = [];

  try {
    // Method 1: Look for JSON data in script tags (many sites embed data this way)
    const jsonMatches =
      html.match(
        /<script[^>]*>(.*?window\.__INITIAL_STATE__.*?)<\/script>/gs,
      ) ||
      html.match(/<script[^>]*>(.*?trafficData.*?)<\/script>/gs) ||
      html.match(/<script[^>]*>(.*?\{.*?"crossing".*?\}.*?)<\/script>/gs);

    if (jsonMatches) {
      console.log('📊 Found potential JSON data in script tags');
      for (const match of jsonMatches) {
        try {
          const jsonData = extractJSONFromScript(match);
          if (jsonData) {
            crossings.push(...parseJSONData(jsonData));
          }
        } catch (error) {
          console.warn('Error parsing JSON from script:', error);
        }
      }
    }

    // Method 2: Parse HTML structure
    if (crossings.length === 0) {
      console.log('🔄 Trying HTML structure parsing...');
      const htmlCrossings = parseHTMLStructure(html);
      crossings.push(...htmlCrossings);
    }

    // Method 3: Text pattern matching as fallback
    if (crossings.length === 0) {
      console.log('🔄 Trying text pattern matching...');
      const textCrossings = parseTextPatterns(html);
      crossings.push(...textCrossings);
    }

    console.log(
      `✅ Parsed ${crossings.length} crossings from traficogaritas.com`,
    );
    return crossings;
  } catch (error) {
    console.error('Error parsing traficogaritas.com:', error);
    return [];
  }
}

function extractJSONFromScript(scriptContent: string): any {
  try {
    // Look for common JSON patterns
    const patterns = [
      /window\.__INITIAL_STATE__\s*=\s*({.*?});/s,
      /trafficData\s*[:=]\s*({.*?})/s,
      /crossings\s*[:=]\s*(\[.*?\])/s,
      /data\s*[:=]\s*({.*?})/s,
    ];

    for (const pattern of patterns) {
      const match = scriptContent.match(pattern);
      if (match) {
        return JSON.parse(match[1]);
      }
    }

    return null;
  } catch (error) {
    console.warn('Error extracting JSON from script:', error);
    return null;
  }
}

function parseJSONData(data: any): TrafficData[] {
  const crossings: TrafficData[] = [];

  try {
    // Handle different JSON structures
    let crossingData = data;

    if (data.crossings) crossingData = data.crossings;
    if (data.data && data.data.crossings) crossingData = data.data.crossings;
    if (data.traffic) crossingData = data.traffic;

    if (Array.isArray(crossingData)) {
      for (const crossing of crossingData) {
        const parsed = parseJSONCrossing(crossing);
        if (parsed) crossings.push(parsed);
      }
    } else if (typeof crossingData === 'object') {
      // Handle object with crossing names as keys
      for (const [name, _value] of Object.entries(crossingData)) {
        const parsed = parseJSONCrossing({ name, ...data });
        if (parsed) crossings.push(parsed);
      }
    }
  } catch (error) {
    console.warn('Error parsing JSON data:', error);
  }

  return crossings;
}

function parseJSONCrossing(data: any): TrafficData | null {
  try {
    const crossing = data.name || data.crossing || data.title || '';
    if (!crossing) return null;

    const lanes = [];

    // Handle different lane data structures
    let laneData = data.lanes || data.lines || data.carriles || [];

    if (!Array.isArray(laneData) && typeof laneData === 'object') {
      laneData = Object.values(laneData);
    }

    for (const lane of laneData) {
      const parsedLane = parseJSONLane(lane);
      if (parsedLane) lanes.push(parsedLane);
    }

    return {
      crossing: normalizeCrossingName(crossing),
      lanes,
    };
  } catch (error) {
    console.warn('Error parsing JSON crossing:', error);
    return null;
  }
}

function parseJSONLane(data: any): any {
  try {
    return {
      name: data.name || data.type || 'General Traffic',
      type: determineLaneType(data.name || data.type || ''),
      waitTime: parseInt(
        data.waitTime || data.wait_time || data.tiempo || data.minutes || '0', 10
      ),
      status: data.status || 'open',
      lastUpdated:
        data.lastUpdated || data.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    return null;
  }
}

function parseHTMLStructure(html: string): TrafficData[] {
  const crossings: TrafficData[] = [];

  try {
    // Common HTML patterns for traffic websites
    const crossingPatterns = [
      // Look for crossing sections
      /<div[^>]*class="[^"]*crossing[^"]*"[^>]*>(.*?)<\/div>/gs,
      /<section[^>]*class="[^"]*garita[^"]*"[^>]*>(.*?)<\/section>/gs,
      /<div[^>]*id="[^"]*crossing[^"]*"[^>]*>(.*?)<\/div>/gs,
      // Look for table rows
      /<tr[^>]*>(.*?)<\/tr>/gs,
      // Look for card structures
      /<div[^>]*class="[^"]*card[^"]*"[^>]*>(.*?)<\/div>/gs,
    ];

    for (const pattern of crossingPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const crossing = parseHTMLCrossing(match[1]);
        if (crossing) crossings.push(crossing);
      }
    }
  } catch (error) {
    console.warn('Error parsing HTML structure:', error);
  }

  return crossings;
}

function parseHTMLCrossing(html: string): TrafficData | null {
  try {
    // Extract crossing name
    const nameMatch =
      html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/) ||
      html.match(/<[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/[^>]*>/) ||
      html.match(/<[^>]*class="[^"]*name[^"]*"[^>]*>(.*?)<\/[^>]*>/);

    const crossing = nameMatch
      ? nameMatch[1].replace(/<[^>]*>/g, '').trim()
      : '';
    if (!crossing) return null;

    // Extract wait times
    const timeMatches = html.matchAll(/(\d+)\s*(min|hour|hr|hora)/gi);
    const lanes = [];

    for (const match of timeMatches) {
      let waitTime = parseInt(match[1], 10);
      if (match[2].toLowerCase().includes('h')) {
        waitTime *= 60;
      }

      // Try to determine lane type from context
      const context = html.substring(
        Math.max(0, match.index! - 100),
        match.index! + 100,
      );
      const laneType = determineLaneTypeFromContext(context);

      lanes.push({
        name: laneType.name,
        type: laneType.type,
        waitTime,
        status: 'open',
        lastUpdated: new Date().toISOString(),
      });
    }

    if (lanes.length === 0) return null;

    return {
      crossing: normalizeCrossingName(crossing),
      lanes,
    };
  } catch (error) {
    console.warn('Error parsing HTML crossing:', error);
    return null;
  }
}

function parseTextPatterns(html: string): TrafficData[] {
  const crossings: TrafficData[] = [];

  // Remove HTML tags for text analysis
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  // Known crossing names
  const crossingNames = [
    'San Ysidro',
    'San Isidro',
    'Otay Mesa',
    'Otay',
    'Otay Comercial',
    'Otay Commercial',
    'Tecate',
    'Calexico',
  ];

  for (const name of crossingNames) {
    const pattern = new RegExp(
      `${name}[\\s\\S]{0,500}?(?=(?:${crossingNames.join('|')})|$)`,
      'i',
    );
    const match = text.match(pattern);

    if (match) {
      const sectionText = match[0];
      const lanes = extractLanesFromText(sectionText);

      if (lanes.length > 0) {
        crossings.push({
          crossing: normalizeCrossingName(name),
          lanes,
        });
      }
    }
  }

  return crossings;
}

function extractLanesFromText(text: string): any[] {
  const lanes = [];
  const timeMatches = text.matchAll(/(\d+)\s*(min|minute|hour|hr|hora)/gi);

  for (const match of timeMatches) {
    let waitTime = parseInt(match[1], 10);
    if (match[2].toLowerCase().includes('h')) {
      waitTime *= 60;
    }

    const context = text.substring(
      Math.max(0, match.index! - 50),
      match.index! + 50,
    );
    const laneType = determineLaneTypeFromContext(context);

    lanes.push({
      name: laneType.name,
      type: laneType.type,
      waitTime,
      status: 'open',
      lastUpdated: new Date().toISOString(),
    });
  }

  return lanes;
}

function determineLaneType(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('sentri')) return 'sentri';
  if (lowerText.includes('ready')) return 'ready_lane';
  if (lowerText.includes('pedestrian') || lowerText.includes('peatonal'))
    return 'pedestrian';
  if (lowerText.includes('commercial') || lowerText.includes('comercial'))
    return 'vehicle';

  return 'vehicle';
}

function determineLaneTypeFromContext(context: string): {
  name: string;
  type: string;
} {
  const lowerContext = context.toLowerCase();

  if (lowerContext.includes('sentri')) {
    return { name: 'SENTRI', type: 'sentri' };
  }
  if (lowerContext.includes('ready')) {
    return { name: 'Ready Lane', type: 'ready_lane' };
  }
  if (
    lowerContext.includes('pedestrian') ||
    lowerContext.includes('peatonal')
  ) {
    return { name: 'Pedestrian', type: 'pedestrian' };
  }
  if (
    lowerContext.includes('commercial') ||
    lowerContext.includes('comercial')
  ) {
    return { name: 'Commercial Traffic', type: 'vehicle' };
  }

  return { name: 'General Traffic', type: 'vehicle' };
}

function normalizeCrossingName(name: string): string {
  const cleaned = name
    .replace(/garita/i, '')
    .replace(/border/i, '')
    .trim();

  const nameMap: { [key: string]: string } = {
    'san ysidro': 'San Ysidro',
    'san isidro': 'San Ysidro',
    'otay mesa': 'Otay Mesa',
    'otay comercial': 'Otay Comercial',
    'otay commercial': 'Otay Comercial',
    tecate: 'Tecate',
    calexico: 'Calexico',
  };

  const lowerName = cleaned.toLowerCase();
  for (const [key, value] of Object.entries(nameMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }

  return cleaned;
}
