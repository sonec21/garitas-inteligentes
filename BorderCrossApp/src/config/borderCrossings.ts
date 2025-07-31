// STATIC BORDER CROSSING LOCATIONS
// These coordinates are PERMANENT and should NEVER be recalculated via Google APIs
// This prevents expensive API calls and ensures consistency across app and Supabase

export interface StaticBorderCrossing {
  id: string;
  name: string;
  city: string;
  country_from: string;
  country_to: string;
  latitude: number;
  longitude: number;
  address: string;
  placeId?: string; // Google Place ID (optional, for map integration)
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  aliases: string[]; // Alternative names from scraping sites
}

// MASTER LIST - Single source of truth for all border crossings
export const STATIC_BORDER_CROSSINGS: StaticBorderCrossing[] = [
  {
    id: 'san-ysidro',
    name: 'San Ysidro',
    city: 'San Diego',
    country_from: 'Mexico',
    country_to: 'USA',
    latitude: 32.5422,
    longitude: -117.0307,
    address: 'San Ysidro, CA 92173, USA',
    placeId: 'ChIJR1jIhx5T2YARQFVbSPr4Fdk',
    operatingHours: {
      open: '00:00',
      close: '23:59',
      is24Hours: true,
    },
    aliases: ['Garita de San Ysidro', 'San Ysidro Port of Entry']
  },
  {
    id: 'san-ysidro-pedwest',
    name: 'San Ysidro PedWest',
    city: 'San Diego',
    country_from: 'Mexico',
    country_to: 'USA',
    latitude: 32.5422,
    longitude: -117.0309,
    address: 'San Ysidro, CA 92173, USA',
    operatingHours: {
      open: '06:00',
      close: '02:00',
      is24Hours: false,
    },
    aliases: ['San Ysidro PedWest', 'PedWest']
  },
  {
    id: 'otay-mesa',
    name: 'Otay Mesa',
    city: 'San Diego',
    country_from: 'Mexico',
    country_to: 'USA',
    latitude: 32.5516,
    longitude: -116.9387,
    address: 'Otay Mesa, CA 92154, USA',
    placeId: 'ChIJaVlTSqVT2YARKVLXqUHHzPI',
    operatingHours: {
      open: '06:00',
      close: '22:00',
      is24Hours: false,
    },
    aliases: ['Garita de Otay', 'Otay Mesa Port of Entry']
  },
  {
    id: 'otay-comercial',
    name: 'Otay Comercial',
    city: 'San Diego',
    country_from: 'Mexico',
    country_to: 'USA',
    latitude: 32.5586,
    longitude: -116.9319,
    address: 'Otay Mesa, CA 92154, USA',
    operatingHours: {
      open: '06:00',
      close: '22:00',
      is24Hours: false,
    },
    aliases: ['Garita de Otay Comercial', 'Otay Commercial']
  },
  {
    id: 'tecate',
    name: 'Tecate',
    city: 'Tecate',
    country_from: 'Mexico',
    country_to: 'USA',
    latitude: 32.5764,
    longitude: -116.6283,
    address: 'Tecate, CA 91980, USA', 
    placeId: 'ChIJK4ESjqFT2YARlWQ8dA4cCho',
    operatingHours: {
      open: '06:00',
      close: '20:00',
      is24Hours: false,
    },
    aliases: ['Tecate Port of Entry']
  },
  {
    id: 'calexico',
    name: 'Calexico',
    city: 'Mexicali',
    country_from: 'Mexico',
    country_to: 'USA',
    latitude: 32.6703,
    longitude: -115.4951,
    address: 'Calexico, CA 92231, USA',
    operatingHours: {
      open: '00:00',
      close: '23:59',
      is24Hours: true,
    },
    aliases: ['Mexicali Port of Entry', 'Calexico East', 'Calexico West', 'Nuevo Mexicali']
  }
];

// Helper functions to find crossings
export const findCrossingById = (id: string): StaticBorderCrossing | undefined => {
  return STATIC_BORDER_CROSSINGS.find(crossing => crossing.id === id);
};

export const findCrossingByName = (name: string): StaticBorderCrossing | undefined => {
  // First try exact name match
  let crossing = STATIC_BORDER_CROSSINGS.find(c => c.name === name);
  if (crossing) return crossing;

  // Then try alias match
  crossing = STATIC_BORDER_CROSSINGS.find(c => 
    c.aliases.some(alias => alias === name)
  );
  if (crossing) return crossing;

  // Finally try partial match
  const lowerName = name.toLowerCase();
  return STATIC_BORDER_CROSSINGS.find(c => 
    c.name.toLowerCase().includes(lowerName) ||
    c.aliases.some(alias => alias.toLowerCase().includes(lowerName))
  );
};

export const getCrossingCoordinates = (name: string): { latitude: number; longitude: number } | null => {
  const crossing = findCrossingByName(name);
  return crossing ? { latitude: crossing.latitude, longitude: crossing.longitude } : null;
};

// Convert to PlacesService format for backward compatibility
export const convertToPlacesServiceFormat = () => {
  return STATIC_BORDER_CROSSINGS.map(crossing => {
    // Generate basic waiting line data for map display
    const waitingLines = generateBasicWaitingLines(crossing);
    
    return {
      id: crossing.id,
      name: crossing.name,
      city: crossing.city,
      placeId: crossing.placeId || `static-${crossing.id}`,
      coordinate: {
        latitude: crossing.latitude,
        longitude: crossing.longitude
      },
      address: crossing.address,
      waitingLines, // Basic waiting lines for map display
      operatingHours: crossing.operatingHours,
      gateStatus: 'open' as const,
      averageWaitTime: 30, // Default, real data comes from database
      lastCarPosition: {
        latitude: crossing.latitude - 0.001, // Slightly south for demo
        longitude: crossing.longitude,
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        lineId: `${crossing.id}-vehicle-1`,
      }
    };
  });
};

// Generate basic waiting lines for map display (no API calls)
const generateBasicWaitingLines = (crossing: StaticBorderCrossing) => {
  const lines = [];
  
  // Vehicle lanes (most crossings have 2)
  for (let i = 1; i <= 2; i++) {
    lines.push({
      id: `${crossing.id}-vehicle-${i}`,
      name: `Vehicle Lane ${i}`,
      type: 'vehicle' as const,
      coordinate: {
        latitude: crossing.latitude - (0.0001 * i), // Slightly offset
        longitude: crossing.longitude - (0.0001 * i)
      },
      estimatedWaitTime: 30 + (i * 5), // Varies by lane
      currentCarCount: 15 + (i * 5)
    });
  }
  
  // Pedestrian lane for most crossings
  if (crossing.id !== 'otay-comercial') { // Commercial crossing typically no pedestrians
    lines.push({
      id: `${crossing.id}-pedestrian`,
      name: 'Pedestrian Lane',
      type: 'pedestrian' as const,
      coordinate: {
        latitude: crossing.latitude + 0.0001,
        longitude: crossing.longitude + 0.0001
      },
      estimatedWaitTime: 10,
      currentCarCount: 25
    });
  }
  
  return lines;
};