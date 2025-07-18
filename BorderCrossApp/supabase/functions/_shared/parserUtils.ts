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

export function getDefaultLatitude(name: string): number {
  const coords: { [key: string]: number } = {
    'San Ysidro': 32.5422,
    'San Ysidro PedWest': 32.5422,
    'Otay Mesa': 32.5586,
    'Otay Comercial': 32.5586,
    Tecate: 32.5761,
    Calexico: 32.6759,
  };
  return coords[name] || 32.55;
}

export function getDefaultLongitude(name: string): number {
  const coords: { [key: string]: number } = {
    'San Ysidro': -117.0309,
    'San Ysidro PedWest': -117.0309,
    'Otay Mesa': -116.9319,
    'Otay Comercial': -116.9319,
    Tecate: -116.6286,
    Calexico: -115.4989,
  };
  return coords[name] || -116.9;
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