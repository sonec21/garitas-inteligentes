# 🚨 Google API Safety Guidelines

## ⚠️ CRITICAL - Read This Before Development

This document outlines safety measures implemented after a **$200 billing incident** caused by excessive Google Distance Matrix API usage during development.

## 🛡️ Safety Measures Implemented

### 1. **Expensive APIs Removed**
- ❌ **Google Distance Matrix API** - COMPLETELY REMOVED FROM CODEBASE
- ❌ **High-frequency traffic calculations** - Replaced with database-driven logic
- ✅ **Google Maps API** - Still enabled (for map display)
- ✅ **Google Places API** - Still enabled but with strict limits

### 2. **API Rate Limiting**
```typescript
// Development Limits (per hour)
MAX_PLACES_CALLS_PER_HOUR: 20
MAX_GEOCODING_CALLS_PER_HOUR: 10  
MAX_DIRECTIONS_CALLS_PER_HOUR: 5

// Production Limits (per hour)
MAX_PLACES_CALLS_PER_HOUR: 100
MAX_GEOCODING_CALLS_PER_HOUR: 50
MAX_DIRECTIONS_CALLS_PER_HOUR: 30
```

### 3. **Caching System**
- **5-minute cache** for all API responses
- **30-minute cache** in development
- Prevents duplicate API calls for same requests

### 4. **Development Safeguards**
- Lower API limits in development
- API call counter with visual warnings
- Emergency stop mechanism
- Cost calculation and monitoring

## 📊 Current API Usage Status

| API Type | Status | Cost (per 1K) | Usage Limit |
|----------|--------|---------------|-------------|
| Distance Matrix | ❌ REMOVED | $5.00* | 0 calls |
| Places Nearby | ✅ Limited | $0.032 | 20/hour (dev) |
| Places Details | ✅ Limited | $0.019 | 20/hour (dev) |
| Geocoding | ✅ Limited | $0.005 | 10/hour (dev) |
| Directions | ✅ Limited | $0.005 | 5/hour (dev) |

## 🔧 How Traffic Data Works Now

Instead of expensive Google APIs, we now use:

1. **Database-driven calculations** based on scraped wait times
2. **Simple distance calculations** using mathematical formulas
3. **Traffic level estimation** based on wait time patterns
4. **Cached landmark data** to minimize API calls

```typescript
// OLD (EXPENSIVE - $200 incident)
const trafficData = await getDistanceMatrix(origins, destinations);

// NEW (FREE - Database driven)
const trafficLevel = calculateTrafficLevel(waitTime);
const vehicleCount = estimateVehicleCount(waitTime, trafficLevel);
```

**Note**: `getDistanceMatrix` function has been **completely removed** from the codebase.

## 🚨 Emergency Procedures

### If API Usage Spikes:
1. **Check Google Cloud Console** - Monitor API usage dashboard
2. **Set EMERGENCY_API_STOP = true** in `apiConfig.ts`
3. **Stop Metro bundler** if in development
4. **Check for infinite loops** in useEffect hooks

### If You See These Warnings:
```
🚫 API call limit reached (20/hour). Request blocked.
⚠️ High API usage detected - Review your code!
💰 Estimated daily cost: $X.XX
```

**STOP DEVELOPMENT IMMEDIATELY** and review your code.

## 📝 Safe Development Practices

### ✅ DO:
- Use the database for traffic calculations
- Cache API responses aggressively  
- Monitor API call counts in console
- Test with small datasets first
- Use `EMERGENCY_API_STOP` if needed

### ❌ DON'T:
- Call APIs in tight loops
- Make API calls on every useEffect
- Use Distance Matrix API (removed)
- Ignore API limit warnings
- Test with high-frequency user interactions

## 🔍 Monitoring API Usage

The app now logs:
```
📡 API call 15/20 (DEV) - Places API
📦 Using cached API response
⚠️ API limit reached - calls blocked
💰 Estimated cost today: $0.15
```

## 🛠️ Configuration Files

- **`src/config/apiConfig.ts`** - API limits and safety controls
- **`src/services/PlacesService.ts`** - Protected API wrapper
- **`GOOGLE_API_SAFETY.md`** - This safety guide

## 📞 If Problems Occur

1. **Set EMERGENCY_API_STOP = true**
2. **Check Google Cloud Console** for usage spikes
3. **Review recent code changes** for API calls
4. **Contact Google Support** if billing issues arise

---

**Remember: The $200 incident happened in just 1-2 days of local testing. Prevention is key!**