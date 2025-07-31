export function parseWaitTime(waitStr: string): number {
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

export function normalizeGaritaName(name: string): string {
  const nameMap: { [key: string]: string } = {
    'Garita de San Ysidro': 'San Ysidro',
    'San Ysidro PedWest': 'San Ysidro PedWest',
    'Garita de Otay': 'Otay Mesa',
    'Garita de Otay Comercial': 'Otay Comercial',
    'Calexico East (Nuevo Mexicali)': 'Calexico',
    'Calexico West (Mexicali Centro)': 'Calexico',
    'Calexico East Comercial (Nuevo Mexicali)': 'Calexico',
    'Tecate': 'Tecate',
  };

  // First, try exact match from nameMap
  if (nameMap[name]) {
    return nameMap[name];
  }

  // Then, try to match by removing "Garita de " prefix
  const cleanedName = name.replace(/^Garita de /, '');
  if (nameMap[cleanedName]) {
    return nameMap[cleanedName];
  }

  // Fallback to cleaned name if no specific mapping
  return cleanedName;
}

export function determineTrafficFlow(waitTime: number): string {
  if (waitTime < 20) return 'fast';
  if (waitTime > 60) return 'slow';
  return 'moderate';
}

export function calculateVehicleCount(
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

// STATIC BORDER CROSSING COORDINATES - NEVER CHANGE
// These match exactly with src/config/borderCrossings.ts
const STATIC_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'San Ysidro': { lat: 32.5422, lng: -117.0307 },
  'San Ysidro PedWest': { lat: 32.5422, lng: -117.0309 },
  'Otay Mesa': { lat: 32.5516, lng: -116.9387 },
  'Otay Comercial': { lat: 32.5586, lng: -116.9319 },
  'Tecate': { lat: 32.5764, lng: -116.6283 },
  'Calexico': { lat: 32.6703, lng: -115.4951 },
  // Add aliases for scraping variations
  'Garita de San Ysidro': { lat: 32.5422, lng: -117.0307 },
  'Garita de Otay': { lat: 32.5516, lng: -116.9387 },
  'Garita de Otay Comercial': { lat: 32.5586, lng: -116.9319 },
  'Calexico East': { lat: 32.6703, lng: -115.4951 },
  'Calexico West': { lat: 32.6703, lng: -115.4951 },
  'Nuevo Mexicali': { lat: 32.6703, lng: -115.4951 },
};

export function getStaticCoordinates(name: string): { lat: number; lng: number } {
  // Direct match first
  if (STATIC_COORDINATES[name]) {
    return STATIC_COORDINATES[name];
  }
  
  // Try partial match for scraped names
  const lowerName = name.toLowerCase();
  for (const [key, coords] of Object.entries(STATIC_COORDINATES)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      console.log(`📍 Matched "${name}" to static coordinates for "${key}"`);
      return coords;
    }
  }
  
  // Default fallback (San Diego area)
  console.warn(`⚠️ No static coordinates found for "${name}", using default`);
  return { lat: 32.55, lng: -116.9 };
}

export function getDefaultLatitude(name: string): number {
  return getStaticCoordinates(name).lat;
}

export function getDefaultLongitude(name: string): number {
  return getStaticCoordinates(name).lng;
}

export function determineLaneType(laneName: string): string {
  const lowerName = laneName.toLowerCase();

  if (lowerName.includes('peatonal') || lowerName.includes('pedestrian')) {
    if (lowerName.includes('sentry')) return 'sentri';
    if (lowerName.includes('ready')) return 'ready_lane';
    return 'pedestrian';
  }

  if (lowerName.includes('sentry')) return 'sentri';
  if (lowerName.includes('ready')) return 'ready_lane';
  if (lowerName.includes('fast')) return 'ready_lane';

  return 'vehicle';
}