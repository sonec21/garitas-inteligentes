// API Configuration and Safety Controls
// This file helps prevent expensive API usage during development

export const API_LIMITS = {
  // Development limits (much lower to prevent accidents)
  DEVELOPMENT: {
    MAX_PLACES_CALLS_PER_HOUR: 20,
    MAX_GEOCODING_CALLS_PER_HOUR: 10,
    MAX_DIRECTIONS_CALLS_PER_HOUR: 5,
    CACHE_EXPIRY_MINUTES: 30, // Longer cache in dev
    ENABLE_EXPENSIVE_APIS: false, // All expensive APIs disabled
  },
  
  // Production limits (higher but still safe)
  PRODUCTION: {
    MAX_PLACES_CALLS_PER_HOUR: 100,
    MAX_GEOCODING_CALLS_PER_HOUR: 50,
    MAX_DIRECTIONS_CALLS_PER_HOUR: 30,
    CACHE_EXPIRY_MINUTES: 5,
    ENABLE_EXPENSIVE_APIS: false, // All expensive APIs disabled
  }
};

export const getCurrentEnvironment = () => {
  const isDev = process.env.NODE_ENV === 'development' || __DEV__;
  return isDev ? 'DEVELOPMENT' : 'PRODUCTION';
};

export const getApiLimits = () => {
  const env = getCurrentEnvironment();
  return API_LIMITS[env];
};

// API Cost Monitoring (approximate costs per 1000 calls)
export const API_COSTS = {
  PLACES_NEARBY_SEARCH: 0.032, // $0.032 per 1K requests
  PLACES_DETAILS: 0.019, // $0.019 per 1K requests  
  GEOCODING: 0.005, // $0.005 per 1K requests
  DIRECTIONS: 0.005, // $0.005 per 1K requests
  // Note: Distance Matrix API completely removed - was $5.00 per 1K (caused $200 bill)
};

export const calculateDailyCost = (calls: { [key: string]: number }) => {
  let totalCost = 0;
  Object.entries(calls).forEach(([apiType, callCount]) => {
    const costPer1K = API_COSTS[apiType as keyof typeof API_COSTS] || 0;
    totalCost += (callCount / 1000) * costPer1K;
  });
  return totalCost;
};

// Emergency stop - if true, all API calls are disabled
export const EMERGENCY_API_STOP = false;

// Development safety warnings
export const DEV_WARNINGS = {
  SHOW_API_COST_WARNINGS: true,
  WARN_ON_HIGH_FREQUENCY_CALLS: true,
  MAX_CALLS_BEFORE_WARNING: 10,
};