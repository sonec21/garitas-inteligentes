export interface BorderCrossing {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lanes: Lane[];
  status: 'open' | 'closed' | 'maintenance';
  lastUpdated: string;
}

export interface Lane {
  id: string;
  name: string;
  type: 'vehicle' | 'pedestrian' | 'ready_lane' | 'sentri';
  status: 'open' | 'closed' | 'halted';
  wait_time: number; // in minutes (matches database)
  vehicle_count: number; // matches database
  traffic_flow: 'slow' | 'moderate' | 'fast'; // matches database
  accidents?: Accident[];
  // Optional backward compatibility properties
  waitTime?: number;
  vehicleCount?: number;
  trafficFlow?: string;
}

// Helper function to adapt database lanes to the app model
export function adaptLane(dbLane: any): Lane {
  return {
    ...dbLane,
    // Add backward compatibility properties
    waitTime: dbLane.wait_time,
    vehicleCount: dbLane.vehicle_count,
    trafficFlow: dbLane.traffic_flow,
  };
}

export interface Accident {
  id: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  timestamp: string;
  resolved: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferredCrossings: string[];
  notifications: boolean;
  language: 'en' | 'es';
  units: 'metric' | 'imperial';
}

export interface ChatMessage {
  id: string;
  user_id: string;
  crossing_id: string;
  message: string;
  timestamp: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export interface RouteInfo {
  distance: number;
  duration: number;
  steps: RouteStep[];
  fastestLane: Lane;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}
