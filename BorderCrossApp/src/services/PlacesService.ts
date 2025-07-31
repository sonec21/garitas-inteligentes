import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import { getApiLimits, getCurrentEnvironment, EMERGENCY_API_STOP, DEV_WARNINGS } from '../config/apiConfig';
import { STATIC_BORDER_CROSSINGS, convertToPlacesServiceFormat, findCrossingByName } from '../config/borderCrossings';

export interface BorderCrossingLocation {
  id: string;
  name: string;
  city: string;
  placeId: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  address: string;
  waitingLines?: WaitingLine[];
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  gateStatus: 'open' | 'closed' | 'limited';
  averageWaitTime: number; // in minutes
  lastCarPosition?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    lineId: string;
  };
}

export interface WaitingLine {
  id: string;
  name: string;
  type: 'vehicle' | 'pedestrian';
  coordinate: {
    latitude: number;
    longitude: number;
  };
  estimatedWaitTime?: number;
  currentCarCount?: number;
  lastCarPosition?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
}

export interface TrafficData {
  placeId: string;
  congestionLevel: 'low' | 'moderate' | 'heavy' | 'severe';
  averageSpeed: number;
  travelTime: number;
  lastUpdated: Date;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  business_status?: string;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
}

class PlacesService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private readonly environment = getCurrentEnvironment();
  private readonly apiLimits = getApiLimits();
  
  // API call tracking and limits
  private apiCallCount = 0;
  private readonly apiCallCache = new Map<string, { data: any; timestamp: number }>();
  private dailyCostEstimate = 0;

  constructor() {
    this.apiKey = GOOGLE_MAPS_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key not found');
    }
    
    // Reset API call counter every hour
    setInterval(() => {
      if (this.apiCallCount > 0) {
        console.log(`🔄 API call counter reset. Previous hour: ${this.apiCallCount} calls (${this.environment})`);
        console.log(`💰 Estimated cost this hour: $${this.dailyCostEstimate.toFixed(4)}`);
      }
      this.apiCallCount = 0;
      this.dailyCostEstimate = 0;
    }, 60 * 60 * 1000);
  }

  // API call protection wrapper with enhanced safety
  private async makeApiCall(url: string, cacheKey?: string, apiType: string = 'UNKNOWN'): Promise<any> {
    // Emergency stop check
    if (EMERGENCY_API_STOP) {
      console.error('🚨 EMERGENCY API STOP ACTIVATED - All API calls blocked');
      throw new Error('Emergency API stop is active');
    }

    // Check API call limit  
    const maxCalls = this.apiLimits.MAX_PLACES_CALLS_PER_HOUR;
    if (this.apiCallCount >= maxCalls) {
      console.warn(`🚫 API call limit reached (${maxCalls}/hour). Request blocked.`);
      throw new Error(`API call limit reached for this hour (${maxCalls})`);
    }

    // Check cache first
    const cacheExpiryTime = this.apiLimits.CACHE_EXPIRY_MINUTES * 60 * 1000;
    if (cacheKey && this.apiCallCache.has(cacheKey)) {
      const cached = this.apiCallCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cacheExpiryTime) {
        console.log(`📦 Using cached ${apiType} response`);
        return cached.data;
      } else {
        this.apiCallCache.delete(cacheKey);
      }
    }

    // Make the API call
    this.apiCallCount++;
    
    // Update cost estimate
    const costPer1K = apiType === 'PLACES' ? 0.032 : 0.005;
    this.dailyCostEstimate += costPer1K / 1000;
    
    console.log(`📡 ${apiType} API call ${this.apiCallCount}/${maxCalls} (${this.environment})`);
    
    // Development warnings
    if (DEV_WARNINGS.SHOW_API_COST_WARNINGS && this.dailyCostEstimate > 0.01) {
      console.warn(`💰 Estimated cost today: $${this.dailyCostEstimate.toFixed(4)}`);
    }
    
    if (DEV_WARNINGS.WARN_ON_HIGH_FREQUENCY_CALLS && this.apiCallCount > DEV_WARNINGS.MAX_CALLS_BEFORE_WARNING) {
      console.warn('⚠️ High API usage detected - Review your code for loops or excessive calls!');
    }
    
    const response = await fetch(url);
    const data = await response.json();

    // Cache the response
    if (cacheKey && data.status === 'OK') {
      this.apiCallCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    type: string = 'establishment'
  ): Promise<PlaceDetails[]> {
    try {
      const url = `${this.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;
      const cacheKey = `nearby_${latitude}_${longitude}_${radius}_${type}`;
      
      const data = await this.makeApiCall(url, cacheKey, 'PLACES');

      if (data.status === 'OK') {
        return data.results.map((place: any) => ({
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.vicinity || place.formatted_address,
          geometry: place.geometry,
          business_status: place.business_status,
          opening_hours: place.opening_hours,
        }));
      } else {
        console.error('Places API error:', data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,business_status,opening_hours&key=${this.apiKey}`;
      const cacheKey = `details_${placeId}`;
      
      const data = await this.makeApiCall(url, cacheKey, 'PLACES');

      if (data.status === 'OK') {
        return {
          place_id: data.result.place_id,
          name: data.result.name,
          formatted_address: data.result.formatted_address,
          geometry: data.result.geometry,
          business_status: data.result.business_status,
          opening_hours: data.result.opening_hours,
        };
      } else {
        console.error('Place details API error:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }


  // UPDATED: Use static border crossing data (no API calls, no recalculation)
  getBorderCrossingLocations(): BorderCrossingLocation[] {
    console.log('📍 Using static border crossing locations (no API calls)');
    return convertToPlacesServiceFormat();
  }

  // UPDATED: Use database-driven traffic calculations instead of expensive Google API
  async getTrafficDataForBorderCrossings(): Promise<TrafficData[]> {
    const borderCrossings = this.getBorderCrossingLocations();
    const trafficData: TrafficData[] = [];

    for (const crossing of borderCrossings) {
      try {
        // Calculate congestion based on wait time instead of Google API
        const waitTime = crossing.averageWaitTime;
        const congestionLevel = this.calculateCongestionFromWaitTime(waitTime);
        const estimatedSpeed = this.estimateSpeedFromWaitTime(waitTime);
        
        trafficData.push({
          placeId: crossing.placeId,
          congestionLevel,
          averageSpeed: estimatedSpeed,
          travelTime: waitTime * 60, // Convert minutes to seconds
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error(`Error calculating traffic data for ${crossing.name}:`, error);
      }
    }

    return trafficData;
  }

  async updateWaitingLineData(lineId: string, carPosition: { latitude: number; longitude: number }): Promise<void> {
    // This would typically update your backend/database with the latest car position
    // For now, we'll just log it
    console.log(`🚗 Updated car position for line ${lineId}:`, carPosition);
    
    // In a real implementation, you might:
    // 1. Send this data to your Supabase database
    // 2. Calculate estimated wait times based on car positions
    // 3. Update real-time statistics
  }

  calculateEstimatedWaitTime(
    waitingLine: WaitingLine,
    currentPosition: { latitude: number; longitude: number }
  ): number {
    // Simple estimation based on distance to the front of the line
    // In a real implementation, this would be more sophisticated
    const distance = this.calculateDistance(
      currentPosition,
      waitingLine.coordinate
    );
    
    // Rough estimation: 1 minute per 100 meters in line
    return Math.round(distance * 10);
  }

  async getDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<any> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${this.apiKey}`;
      const cacheKey = `directions_${originStr}_${destinationStr}`;
      
      const data = await this.makeApiCall(url, cacheKey, 'DIRECTIONS');

      if (data.status === 'OK') {
        return data.routes[0];
      } else {
        console.error('Directions API error:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  }

  getBorderCrossingsByCity(): { [city: string]: BorderCrossingLocation[] } {
    const crossings = this.getBorderCrossingLocations();
    const groupedByCity: { [city: string]: BorderCrossingLocation[] } = {};
    
    crossings.forEach(crossing => {
      if (!groupedByCity[crossing.city]) {
        groupedByCity[crossing.city] = [];
      }
      groupedByCity[crossing.city].push(crossing);
    });
    
    return groupedByCity;
  }

  isGateOpen(crossing: BorderCrossingLocation): boolean {
    if (crossing.operatingHours.is24Hours) {
      return crossing.gateStatus === 'open';
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(crossing.operatingHours.open.replace(':', ''));
    const closeTime = parseInt(crossing.operatingHours.close.replace(':', ''));
    
    const isWithinHours = currentTime >= openTime && currentTime <= closeTime;
    return isWithinHours && crossing.gateStatus === 'open';
  }

  async detectUserCity(latitude: number, longitude: number): Promise<string> {
    try {
      // OPTIMIZATION: Use geographic approximation first (no API calls)
      const geoCity = this.approximateCityFromCoordinates(latitude, longitude);
      if (geoCity !== 'Unknown') {
        console.log(`📍 City detected using coordinates: ${geoCity} (no API call)`);
        return geoCity;
      }
      
      // Only use Google API if really needed and within limits
      if (this.apiCallCount >= this.apiLimits.MAX_GEOCODING_CALLS_PER_HOUR - 2) {
        console.warn('🚫 Geocoding API limit near, using coordinate approximation');
        return this.approximateCityFromCoordinates(latitude, longitude);
      }
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      const cacheKey = `geocode_${latitude.toFixed(3)}_${longitude.toFixed(3)}`; // Rounded for better caching
      
      const data = await this.makeApiCall(url, cacheKey, 'GEOCODING');

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // Look for locality (city) in address components
        for (const component of result.address_components) {
          if (component.types.includes('locality')) {
            return component.long_name;
          }
          if (component.types.includes('administrative_area_level_2')) {
            return component.long_name;
          }
        }
        
        // Fallback: extract city from formatted address
        const addressParts = result.formatted_address.split(',');
        if (addressParts.length >= 2) {
          return addressParts[1].trim();
        }
      }
      
      return this.approximateCityFromCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error detecting user city:', error);
      return this.approximateCityFromCoordinates(latitude, longitude);
    }
  }

  // Helper: Approximate city from coordinates (no API calls)
  private approximateCityFromCoordinates(latitude: number, longitude: number): string {
    // San Diego area
    if (latitude >= 32.5 && latitude <= 32.7 && longitude >= -117.5 && longitude <= -116.9) {
      return 'San Diego';
    }
    // Tecate area  
    if (latitude >= 32.5 && latitude <= 32.6 && longitude >= -116.7 && longitude <= -116.5) {
      return 'Tecate';
    }
    // Mexicali/Calexico area
    if (latitude >= 32.6 && latitude <= 32.8 && longitude >= -115.6 && longitude <= -115.3) {
      return 'Mexicali';
    }
    
    // Default to closest major city
    if (longitude > -116.5) return 'Mexicali';
    if (longitude > -117.0) return 'Tecate';
    return 'San Diego';
  }

  getNearestCrossingsToLocation(
    userLocation: { latitude: number; longitude: number },
    maxResults: number = 10
  ): BorderCrossingLocation[] {
    const crossings = this.getBorderCrossingLocations();
    
    return crossings
      .map(crossing => ({
        ...crossing,
        distance: this.calculateDistance(userLocation, crossing.coordinate)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults)
      .map(({ distance, ...crossing }) => crossing);
  }

  getCrossingsForUserCity(userCity: string): BorderCrossingLocation[] {
    const crossings = this.getBorderCrossingLocations();
    
    // If user is in the same city as a crossing, return those crossings
    const sameCityCrossings = crossings.filter(crossing => 
      crossing.city.toLowerCase() === userCity.toLowerCase()
    );
    
    if (sameCityCrossings.length > 0) {
      return sameCityCrossings.sort((a, b) => a.averageWaitTime - b.averageWaitTime);
    }
    
    // If no crossings in same city, return all crossings sorted by wait time
    return crossings.sort((a, b) => a.averageWaitTime - b.averageWaitTime);
  }

  getCrossingsWithRecommendations(
    userLocation: { latitude: number; longitude: number },
    userCity?: string
  ): Array<BorderCrossingLocation & { 
    distance: number; 
    distanceText: string; 
    recommendation: 'best' | 'fastest' | 'nearest' | 'normal';
    recommendationReason: string;
  }> {
    const crossings = this.getBorderCrossingLocations();
    
    const crossingsWithData = crossings.map(crossing => {
      const distance = this.calculateDistance(userLocation, crossing.coordinate);
      const distanceText = distance < 1000 
        ? `${Math.round(distance)}m` 
        : `${(distance / 1000).toFixed(1)}km`;
      
      let recommendation: 'best' | 'fastest' | 'nearest' | 'normal' = 'normal';
      let recommendationReason = '';
      
      return {
        ...crossing,
        distance,
        distanceText,
        recommendation,
        recommendationReason
      };
    });
    
    // Sort by distance first
    crossingsWithData.sort((a, b) => a.distance - b.distance);
    
    // Assign recommendations
    const shortestWaitTime = Math.min(...crossingsWithData.map(c => c.averageWaitTime));
    const nearestCrossing = crossingsWithData[0];
    
    crossingsWithData.forEach((crossing, index) => {
      if (crossing.averageWaitTime === shortestWaitTime && crossing.averageWaitTime <= 15) {
        (crossing as any).recommendation = 'best';
        crossing.recommendationReason = 'Shortest wait time and very fast';
      } else if (crossing.averageWaitTime === shortestWaitTime) {
        (crossing as any).recommendation = 'fastest';
        crossing.recommendationReason = 'Shortest wait time';
      } else if (crossing.id === nearestCrossing.id && crossing.distance < 5000) {
        (crossing as any).recommendation = 'nearest';
        crossing.recommendationReason = 'Closest to your location';
      }
    });
    
    // Sort by distance for final display (closest first)
    return crossingsWithData.sort((a, b) => a.distance - b.distance);
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Helper functions for database-driven traffic calculations (replacing expensive Google APIs)
  private calculateCongestionFromWaitTime(waitTime: number): 'low' | 'moderate' | 'heavy' | 'severe' {
    if (waitTime < 20) return 'low';
    if (waitTime < 45) return 'moderate';
    if (waitTime < 90) return 'heavy';
    return 'severe';
  }

  private estimateSpeedFromWaitTime(waitTime: number): number {
    // Estimate average speed based on wait time (km/h)
    if (waitTime < 20) return 45; // Light traffic
    if (waitTime < 45) return 25; // Moderate traffic  
    if (waitTime < 90) return 15; // Heavy traffic
    return 8; // Severe traffic
  }

  private calculateTrafficLevel(waitTime: number): 'light' | 'moderate' | 'heavy' | 'severe' {
    if (waitTime < 20) return 'light';
    if (waitTime < 45) return 'moderate';
    if (waitTime < 90) return 'heavy';
    return 'severe';
  }

  private estimateVehicleCount(waitTime: number, trafficLevel: 'light' | 'moderate' | 'heavy' | 'severe'): number {
    const baseMultiplier = {
      'light': 0.7,
      'moderate': 1.0,
      'heavy': 1.3,
      'severe': 1.8
    };
    
    let vehicleCount = Math.floor(waitTime * baseMultiplier[trafficLevel]);
    
    // Add some randomness to simulate real-time changes
    vehicleCount += Math.floor(Math.random() * 10) - 5; // ±5 vehicles
    return Math.max(5, vehicleCount); // Minimum 5 vehicles
  }

  // Simplified queue end calculation (no expensive Google Directions API)
  private async calculateQueueEndLocationSimple(
    crossing: BorderCrossingLocation,
    vehicleCount: number
  ): Promise<{
    latitude: number;
    longitude: number;
    nearbyLandmark?: string;
    estimatedDistance: number;
  } | null> {
    try {
      const avgVehicleSpacing = 6.5; // meters per vehicle
      const queueLength = vehicleCount * avgVehicleSpacing;
      
      // Simple estimation: extend south from the border crossing
      const latOffset = queueLength / 111320; // Rough conversion: 1 degree lat ≈ 111,320 meters
      
      const endLocation = {
        latitude: crossing.coordinate.latitude - latOffset,
        longitude: crossing.coordinate.longitude,
      };
      
      // Only use Google Places API for landmark if within reasonable limits
      let nearbyLandmark = `Approximately ${(queueLength / 1000).toFixed(1)}km from border`;
      
      if (this.apiCallCount < this.apiLimits.MAX_PLACES_CALLS_PER_HOUR - 5) { // Keep some buffer
        try {
          const landmark = await this.findNearestLandmark(
            endLocation.latitude,
            endLocation.longitude,
            crossing.coordinate
          );
          if (landmark) {
            nearbyLandmark = landmark.fullDescription;
          }
        } catch (error) {
          console.warn('Could not get landmark, using distance estimate');
        }
      }
      
      return {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        nearbyLandmark,
        estimatedDistance: queueLength
      };
    } catch (error) {
      console.error('Error calculating simple queue location:', error);
      return null;
    }
  }

  // Real-time queue tracking methods
  async calculateQueueEndLocation(
    crossing: BorderCrossingLocation,
    vehicleCount: number
  ): Promise<{ 
    latitude: number; 
    longitude: number; 
    nearbyLandmark?: string;
    landmarkDetails?: {
      landmarkName: string;
      distance: number;
      direction: 'before' | 'after';
      distanceText: string;
      fullDescription: string;
      exactLocation?: {
        closestBuilding: string;
        buildingDistance: number;
        buildingDistanceText: string;
        streetAddress: string;
      };
    };
    estimatedDistance: number;
  } | null> {
    try {
      const baseCoordinate = crossing.coordinate;
      
      // Calculate average vehicle length (car: 4.5m, spacing: 2m = ~6.5m per vehicle)
      const avgVehicleSpacing = 6.5; // meters
      const queueLength = vehicleCount * avgVehicleSpacing;
      
      // Get the main road direction approaching the border
      const directions = await this.getDirections(
        {
          latitude: baseCoordinate.latitude - 0.01, // Point 1km south
          longitude: baseCoordinate.longitude
        },
        baseCoordinate
      );
      
      if (directions && directions.legs && directions.legs[0]) {
        const route = directions.legs[0];
        const steps = route.steps;
        
        // Find the step that contains the queue end location
        let accumulatedDistance = 0;
        let endLocation = baseCoordinate;
        
        // Work backwards from the border to find queue end
        for (let i = steps.length - 1; i >= 0; i--) {
          const step = steps[i];
          const stepDistance = step.distance.value; // in meters
          
          if (accumulatedDistance + stepDistance >= queueLength) {
            // Queue end is within this step
            const remainingDistance = queueLength - accumulatedDistance;
            const ratio = remainingDistance / stepDistance;
            
            // Interpolate the exact position
            const startLat = step.start_location.lat;
            const startLng = step.start_location.lng;
            const endLat = step.end_location.lat;
            const endLng = step.end_location.lng;
            
            endLocation = {
              latitude: startLat + (endLat - startLat) * (1 - ratio),
              longitude: startLng + (endLng - startLng) * (1 - ratio)
            };
            break;
          }
          
          accumulatedDistance += stepDistance;
        }
        
        // Find nearby landmark at the queue end location
        const landmarkDetails = await this.findNearestLandmark(
          endLocation.latitude,
          endLocation.longitude,
          baseCoordinate
        );
        
        return {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          nearbyLandmark: landmarkDetails?.fullDescription,
          landmarkDetails,
          estimatedDistance: queueLength
        };
      }
      
      // Fallback: estimate based on straight line distance
      const bearing = this.calculateBearing(
        { latitude: baseCoordinate.latitude - 0.01, longitude: baseCoordinate.longitude },
        baseCoordinate
      );
      
      const endLocation = this.calculateDestination(
        baseCoordinate,
        bearing + 180, // Opposite direction
        queueLength
      );
      
      const landmarkDetails = await this.findNearestLandmark(
        endLocation.latitude,
        endLocation.longitude,
        baseCoordinate
      );
      
      return {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        nearbyLandmark: landmarkDetails?.fullDescription,
        landmarkDetails,
        estimatedDistance: queueLength
      };
      
    } catch (error) {
      console.error('Error calculating queue end location:', error);
      return null;
    }
  }

  async findNearestLandmark(
    latitude: number, 
    longitude: number,
    borderCoordinate?: { latitude: number; longitude: number }
  ): Promise<{
    landmarkName: string;
    distance: number;
    direction: 'before' | 'after';
    distanceText: string;
    fullDescription: string;
    exactLocation?: {
      closestBuilding: string;
      buildingDistance: number;
      buildingDistanceText: string;
      streetAddress: string;
    };
  } | undefined> {
    try {
      // Search for notable places nearby
      const places = await this.searchNearbyPlaces(
        latitude,
        longitude,
        500, // 500m radius
        'establishment'
      );
      
      let selectedPlace = null;
      
      if (places.length === 0) {
        // Try a broader search with different types
        const broaderSearch = await this.searchNearbyPlaces(
          latitude,
          longitude,
          1000, // 1km radius
          'point_of_interest'
        );
        
        if (broaderSearch.length > 0) {
          selectedPlace = broaderSearch[0];
        }
      } else {
        // Filter for recognizable landmarks
        const landmarks = places.filter(place => {
          const name = place.name.toLowerCase();
          return (
            name.includes('mall') ||
            name.includes('center') ||
            name.includes('plaza') ||
            name.includes('hotel') ||
            name.includes('hospital') ||
            name.includes('school') ||
            name.includes('university') ||
            name.includes('bank') ||
            name.includes('gas') ||
            name.includes('station') ||
            name.includes('restaurant') ||
            name.includes('store') ||
            name.includes('market') ||
            name.includes('pharmacy') ||
            name.includes('government') ||
            name.includes('building') ||
            name.includes('park') ||
            name.includes('church') ||
            name.includes('bridge')
          );
        });
        
        selectedPlace = landmarks.length > 0 ? landmarks[0] : places[0];
      }
      
      if (selectedPlace) {
        // Calculate distance from queue end to landmark
        const distanceToLandmark = this.calculateDistance(
          { latitude, longitude },
          { 
            latitude: selectedPlace.geometry.location.lat, 
            longitude: selectedPlace.geometry.location.lng 
          }
        );
        
        // Determine direction relative to border (south to north flow)
        let direction: 'before' | 'after' = 'before';
        if (borderCoordinate) {
          // Check if landmark is closer to border than queue end
          const landmarkToBorder = this.calculateDistance(
            { 
              latitude: selectedPlace.geometry.location.lat, 
              longitude: selectedPlace.geometry.location.lng 
            },
            borderCoordinate
          );
          const queueEndToBorder = this.calculateDistance(
            { latitude, longitude },
            borderCoordinate
          );
          
          // If landmark is closer to border, queue end is "before" the landmark (south of it)
          // If landmark is farther from border, queue end is "after" the landmark (north of it)
          direction = landmarkToBorder < queueEndToBorder ? 'before' : 'after';
        }
        
        const distanceText = distanceToLandmark < 1000 
          ? `${Math.round(distanceToLandmark)}m` 
          : `${(distanceToLandmark / 1000).toFixed(1)}km`;
        
        const directionText = direction === 'before' ? 'before reaching' : 'past';
        
        // Find the exact location details
        const exactLocation = await this.getExactLocationDetails(latitude, longitude);
        
        return {
          landmarkName: selectedPlace.name,
          distance: distanceToLandmark,
          direction,
          distanceText,
          fullDescription: `${distanceText} ${directionText} ${selectedPlace.name}`,
          exactLocation
        };
      }
      
      // Fallback to street address
      const streetAddress = await this.getStreetAddress(latitude, longitude);
      const exactLocation = await this.getExactLocationDetails(latitude, longitude);
      
      return {
        landmarkName: streetAddress,
        distance: 0,
        direction: 'before',
        distanceText: '0m',
        fullDescription: streetAddress,
        exactLocation
      };
      
    } catch (error) {
      console.error('Error finding nearest landmark:', error);
      
      // Ultimate fallback
      try {
        const streetAddress = await this.getStreetAddress(latitude, longitude);
        const exactLocation = await this.getExactLocationDetails(latitude, longitude);
        
        return {
          landmarkName: streetAddress,
          distance: 0,
          direction: 'before',
          distanceText: '0m',
          fullDescription: streetAddress,
          exactLocation
        };
      } catch (addressError) {
        console.error('Error getting street address:', addressError);
        return {
          landmarkName: 'Location coordinates available',
          distance: 0,
          direction: 'before',
          distanceText: '0m',
          fullDescription: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        };
      }
    }
  }

  async getExactLocationDetails(latitude: number, longitude: number): Promise<{
    closestBuilding: string;
    buildingDistance: number;
    buildingDistanceText: string;
    streetAddress: string;
  } | undefined> {
    try {
      // Search for the closest buildings/establishments within a very small radius
      const veryCloseBuildings = await this.searchNearbyPlaces(
        latitude,
        longitude,
        100, // Very close radius - 100m
        'establishment'
      );
      
      // Get the street address
      const streetAddress = await this.getStreetAddress(latitude, longitude);
      
      if (veryCloseBuildings.length > 0) {
        const closestBuilding = veryCloseBuildings[0];
        const buildingDistance = this.calculateDistance(
          { latitude, longitude },
          { 
            latitude: closestBuilding.geometry.location.lat, 
            longitude: closestBuilding.geometry.location.lng 
          }
        );
        
        const buildingDistanceText = buildingDistance < 1000 
          ? `${Math.round(buildingDistance)}m` 
          : `${(buildingDistance / 1000).toFixed(1)}km`;
        
        return {
          closestBuilding: closestBuilding.name,
          buildingDistance,
          buildingDistanceText,
          streetAddress
        };
      }
      
      // If no close buildings, try a slightly larger radius for any point of interest
      const nearbyPOI = await this.searchNearbyPlaces(
        latitude,
        longitude,
        200, // 200m radius
        'point_of_interest'
      );
      
      if (nearbyPOI.length > 0) {
        const closestPOI = nearbyPOI[0];
        const poiDistance = this.calculateDistance(
          { latitude, longitude },
          { 
            latitude: closestPOI.geometry.location.lat, 
            longitude: closestPOI.geometry.location.lng 
          }
        );
        
        const poiDistanceText = poiDistance < 1000 
          ? `${Math.round(poiDistance)}m` 
          : `${(poiDistance / 1000).toFixed(1)}km`;
        
        return {
          closestBuilding: closestPOI.name,
          buildingDistance: poiDistance,
          buildingDistanceText: poiDistanceText,
          streetAddress
        };
      }
      
      // Fallback: just return street address
      return {
        closestBuilding: 'No nearby buildings found',
        buildingDistance: 0,
        buildingDistanceText: '0m',
        streetAddress
      };
      
    } catch (error) {
      console.error('Error getting exact location details:', error);
      
      // Ultimate fallback
      try {
        const streetAddress = await this.getStreetAddress(latitude, longitude);
        return {
          closestBuilding: 'Unable to detect nearby buildings',
          buildingDistance: 0,
          buildingDistanceText: '0m',
          streetAddress
        };
      } catch (addressError) {
        return undefined;
      }
    }
  }

  async getStreetAddress(latitude: number, longitude: number): Promise<string> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      const cacheKey = `street_${latitude}_${longitude}`;
      
      const data = await this.makeApiCall(url, cacheKey, 'GEOCODING');

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        
        // Try to get a simplified address
        const addressComponents = result.address_components;
        let streetName = '';
        let streetNumber = '';
        
        for (const component of addressComponents) {
          if (component.types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (component.types.includes('route')) {
            streetName = component.long_name;
          }
        }
        
        if (streetName && streetNumber) {
          return `${streetNumber} ${streetName}`;
        } else if (streetName) {
          return streetName;
        }
        
        // Fallback to formatted address
        return result.formatted_address.split(',')[0];
      }
      
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting street address:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  private calculateBearing(start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }): number {
    const lat1 = start.latitude * Math.PI / 180;
    const lat2 = end.latitude * Math.PI / 180;
    const deltaLng = (end.longitude - start.longitude) * Math.PI / 180;
    
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  private calculateDestination(
    start: { latitude: number; longitude: number },
    bearing: number,
    distance: number
  ): { latitude: number; longitude: number } {
    const R = 6371e3; // Earth's radius in meters
    const bearingRad = bearing * Math.PI / 180;
    const lat1 = start.latitude * Math.PI / 180;
    const lng1 = start.longitude * Math.PI / 180;
    
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
    );
    
    const lng2 = lng1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );
    
    return {
      latitude: lat2 * 180 / Math.PI,
      longitude: lng2 * 180 / Math.PI
    };
  }

  // UPDATED: Database-driven queue data (no expensive Google APIs)
  async getRealTimeQueueData(crossing: BorderCrossingLocation): Promise<{
    vehicleCount: number;
    queueEndLocation: { 
      latitude: number; 
      longitude: number; 
      nearbyLandmark?: string; 
      landmarkDetails?: {
        landmarkName: string;
        distance: number;
        direction: 'before' | 'after';
        distanceText: string;
        fullDescription: string;
        exactLocation?: {
          closestBuilding: string;
          buildingDistance: number;
          buildingDistanceText: string;
          streetAddress: string;
        };
      };
      estimatedDistance: number;
    } | null;
    lastCarTimestamp: Date;
    trafficLevel: 'light' | 'moderate' | 'heavy' | 'severe';
  }> {
    try {
      // Use wait time based calculations instead of expensive Google API
      const waitTime = crossing.averageWaitTime;
      const trafficLevel = this.calculateTrafficLevel(waitTime);
      const vehicleCount = this.estimateVehicleCount(waitTime, trafficLevel);
      
      // Calculate queue end location using simple estimation
      const queueEndLocation = await this.calculateQueueEndLocationSimple(crossing, vehicleCount);
      
      return {
        vehicleCount,
        queueEndLocation,
        lastCarTimestamp: new Date(Date.now() - Math.random() * 900000), // Random time within last 15 minutes
        trafficLevel
      };
      
    } catch (error) {
      console.error('Error getting real-time queue data:', error);
      
      // Fallback to basic estimated data
      const estimatedVehicleCount = Math.max(5, crossing.averageWaitTime);
      
      return {
        vehicleCount: estimatedVehicleCount,
        queueEndLocation: null,
        lastCarTimestamp: new Date(Date.now() - 300000), // 5 minutes ago
        trafficLevel: 'moderate'
      };
    }
  }
}

export default new PlacesService();