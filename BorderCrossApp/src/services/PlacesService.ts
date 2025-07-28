import { GOOGLE_PLACES_API_KEY } from '@env';

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

  constructor() {
    this.apiKey = GOOGLE_PLACES_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️ Google Places API key not found');
    }
  }

  async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    type: string = 'establishment'
  ): Promise<PlaceDetails[]> {
    try {
      const url = `${this.baseUrl}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

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
      
      const response = await fetch(url);
      const data = await response.json();

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

  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>
  ): Promise<any> {
    try {
      const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
      const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&departure_time=now&traffic_model=best_guess&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data;
      } else {
        console.error('Distance Matrix API error:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      return null;
    }
  }

  getBorderCrossingLocations(): BorderCrossingLocation[] {
    return [
      {
        id: 'san-ysidro',
        name: 'San Ysidro Port of Entry',
        city: 'San Diego',
        placeId: 'ChIJR1jIhx5T2YARQFVbSPr4Fdk',
        coordinate: { latitude: 32.5422, longitude: -117.0307 },
        address: 'San Ysidro, CA 92173, USA',
        operatingHours: {
          open: '00:00',
          close: '23:59',
          is24Hours: true,
        },
        gateStatus: 'open',
        averageWaitTime: 45,
        lastCarPosition: {
          latitude: 32.5419,
          longitude: -117.0305,
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          lineId: 'sy-vehicle-1',
        },
        waitingLines: [
          {
            id: 'sy-vehicle-1',
            name: 'Vehicle Lane 1',
            type: 'vehicle',
            coordinate: { latitude: 32.5420, longitude: -117.0305 },
            estimatedWaitTime: 45,
            currentCarCount: 25,
          },
          {
            id: 'sy-vehicle-2',
            name: 'Vehicle Lane 2',
            type: 'vehicle',
            coordinate: { latitude: 32.5421, longitude: -117.0306 },
            estimatedWaitTime: 38,
            currentCarCount: 20,
          },
          {
            id: 'sy-pedestrian',
            name: 'Pedestrian Lane',
            type: 'pedestrian',
            coordinate: { latitude: 32.5423, longitude: -117.0308 },
            estimatedWaitTime: 15,
            currentCarCount: 30,
          },
        ],
      },
      {
        id: 'otay-mesa',
        name: 'Otay Mesa Port of Entry',
        city: 'San Diego',
        placeId: 'ChIJaVlTSqVT2YARKVLXqUHHzPI',
        coordinate: { latitude: 32.5516, longitude: -116.9387 },
        address: 'Otay Mesa, CA 92154, USA',
        operatingHours: {
          open: '06:00',
          close: '22:00',
          is24Hours: false,
        },
        gateStatus: 'open',
        averageWaitTime: 25,
        lastCarPosition: {
          latitude: 32.5513,
          longitude: -116.9385,
          timestamp: new Date(Date.now() - 180000), // 3 minutes ago
          lineId: 'om-vehicle-1',
        },
        waitingLines: [
          {
            id: 'om-vehicle-1',
            name: 'Vehicle Lane 1',
            type: 'vehicle',
            coordinate: { latitude: 32.5514, longitude: -116.9385 },
            estimatedWaitTime: 25,
            currentCarCount: 15,
          },
          {
            id: 'om-vehicle-2',
            name: 'Vehicle Lane 2',
            type: 'vehicle',
            coordinate: { latitude: 32.5515, longitude: -116.9386 },
            estimatedWaitTime: 30,
            currentCarCount: 18,
          },
        ],
      },
      {
        id: 'tecate',
        name: 'Tecate Port of Entry',
        city: 'Tecate',
        placeId: 'ChIJK4ESjqFT2YARlWQ8dA4cCho',
        coordinate: { latitude: 32.5764, longitude: -116.6283 },
        address: 'Tecate, CA 91980, USA',
        operatingHours: {
          open: '06:00',
          close: '20:00',
          is24Hours: false,
        },
        gateStatus: 'open',
        averageWaitTime: 10,
        lastCarPosition: {
          latitude: 32.5761,
          longitude: -116.6281,
          timestamp: new Date(Date.now() - 600000), // 10 minutes ago
          lineId: 'tc-vehicle-1',
        },
        waitingLines: [
          {
            id: 'tc-vehicle-1',
            name: 'Vehicle Lane 1',
            type: 'vehicle',
            coordinate: { latitude: 32.5762, longitude: -116.6281 },
            estimatedWaitTime: 10,
            currentCarCount: 5,
          },
        ],
      },
      {
        id: 'mexicali',
        name: 'Mexicali Port of Entry',
        city: 'Mexicali',
        placeId: 'ChIJaVlTSqVT2YARKVLXqUHHzPI',
        coordinate: { latitude: 32.6703, longitude: -115.4951 },
        address: 'Mexicali, Baja California, Mexico',
        operatingHours: {
          open: '00:00',
          close: '23:59',
          is24Hours: true,
        },
        gateStatus: 'open',
        averageWaitTime: 60,
        lastCarPosition: {
          latitude: 32.6700,
          longitude: -115.4950,
          timestamp: new Date(Date.now() - 420000), // 7 minutes ago
          lineId: 'mx-vehicle-1',
        },
        waitingLines: [
          {
            id: 'mx-vehicle-1',
            name: 'Vehicle Lane 1',
            type: 'vehicle',
            coordinate: { latitude: 32.6700, longitude: -115.4950 },
            estimatedWaitTime: 60,
            currentCarCount: 40,
          },
          {
            id: 'mx-vehicle-2',
            name: 'Vehicle Lane 2',
            type: 'vehicle',
            coordinate: { latitude: 32.6701, longitude: -115.4951 },
            estimatedWaitTime: 55,
            currentCarCount: 35,
          },
        ],
      },
    ];
  }

  async getTrafficDataForBorderCrossings(): Promise<TrafficData[]> {
    const borderCrossings = this.getBorderCrossingLocations();
    const trafficData: TrafficData[] = [];

    for (const crossing of borderCrossings) {
      try {
        // Get traffic data using Distance Matrix API with current time
        const origins = [{ lat: crossing.coordinate.latitude, lng: crossing.coordinate.longitude }];
        const destinations = [{ lat: crossing.coordinate.latitude + 0.01, lng: crossing.coordinate.longitude + 0.01 }];
        
        const distanceData = await this.getDistanceMatrix(origins, destinations);
        
        if (distanceData && distanceData.rows[0].elements[0].status === 'OK') {
          const element = distanceData.rows[0].elements[0];
          const travelTime = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;
          const normalTravelTime = element.duration.value;
          
          // Calculate congestion level based on travel time difference
          const congestionRatio = travelTime / normalTravelTime;
          let congestionLevel: 'low' | 'moderate' | 'heavy' | 'severe';
          
          if (congestionRatio < 1.2) congestionLevel = 'low';
          else if (congestionRatio < 1.5) congestionLevel = 'moderate';
          else if (congestionRatio < 2.0) congestionLevel = 'heavy';
          else congestionLevel = 'severe';

          trafficData.push({
            placeId: crossing.placeId,
            congestionLevel,
            averageSpeed: element.distance.value / travelTime * 3.6, // km/h
            travelTime,
            lastUpdated: new Date(),
          });
        }
      } catch (error) {
        console.error(`Error getting traffic data for ${crossing.name}:`, error);
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
      
      const response = await fetch(url);
      const data = await response.json();

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
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

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
      
      // Default fallback based on coordinates (rough estimation)
      if (latitude >= 32.5 && latitude <= 32.7 && longitude >= -117.5 && longitude <= -116.9) {
        return 'San Diego';
      } else if (latitude >= 32.5 && latitude <= 32.6 && longitude >= -116.7 && longitude <= -116.5) {
        return 'Tecate';
      } else if (latitude >= 32.6 && latitude <= 32.8 && longitude >= -115.6 && longitude <= -115.3) {
        return 'Mexicali';
      }
      
      return 'Unknown';
    } catch (error) {
      console.error('Error detecting user city:', error);
      return 'Unknown';
    }
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
        crossing.recommendation = 'best';
        crossing.recommendationReason = 'Shortest wait time and very fast';
      } else if (crossing.averageWaitTime === shortestWaitTime) {
        crossing.recommendation = 'fastest';
        crossing.recommendationReason = 'Shortest wait time';
      } else if (crossing.id === nearestCrossing.id && crossing.distance < 5000) {
        crossing.recommendation = 'nearest';
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
      
      const response = await fetch(url);
      const data = await response.json();

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

  // Enhanced real-time queue data using Google Maps traffic data
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
      // Get current traffic data
      const trafficData = await this.getDistanceMatrix(
        [{ lat: crossing.coordinate.latitude, lng: crossing.coordinate.longitude }],
        [{ lat: crossing.coordinate.latitude + 0.01, lng: crossing.coordinate.longitude + 0.01 }]
      );
      
      let vehicleCount = crossing.averageWaitTime; // Base estimate
      let trafficLevel: 'light' | 'moderate' | 'heavy' | 'severe' = 'moderate';
      
      if (trafficData && trafficData.rows[0].elements[0].status === 'OK') {
        const element = trafficData.rows[0].elements[0];
        const travelTime = element.duration_in_traffic ? element.duration_in_traffic.value : element.duration.value;
        const normalTravelTime = element.duration.value;
        const congestionRatio = travelTime / normalTravelTime;
        
        // Estimate vehicle count based on congestion and wait time
        if (congestionRatio < 1.2) {
          trafficLevel = 'light';
          vehicleCount = Math.max(5, Math.floor(crossing.averageWaitTime * 0.7));
        } else if (congestionRatio < 1.5) {
          trafficLevel = 'moderate';
          vehicleCount = Math.floor(crossing.averageWaitTime * 1.0);
        } else if (congestionRatio < 2.0) {
          trafficLevel = 'heavy';
          vehicleCount = Math.floor(crossing.averageWaitTime * 1.3);
        } else {
          trafficLevel = 'severe';
          vehicleCount = Math.floor(crossing.averageWaitTime * 1.8);
        }
        
        // Add some randomness to simulate real-time changes
        vehicleCount += Math.floor(Math.random() * 10) - 5; // ±5 vehicles
        vehicleCount = Math.max(0, vehicleCount);
      }
      
      // Calculate queue end location
      const queueEndLocation = await this.calculateQueueEndLocation(crossing, vehicleCount);
      
      return {
        vehicleCount,
        queueEndLocation,
        lastCarTimestamp: new Date(Date.now() - Math.random() * 900000), // Random time within last 15 minutes
        trafficLevel
      };
      
    } catch (error) {
      console.error('Error getting real-time queue data:', error);
      
      // Fallback to estimated data
      const estimatedVehicleCount = Math.max(5, crossing.averageWaitTime);
      const queueEndLocation = await this.calculateQueueEndLocation(crossing, estimatedVehicleCount);
      
      return {
        vehicleCount: estimatedVehicleCount,
        queueEndLocation,
        lastCarTimestamp: new Date(Date.now() - 300000), // 5 minutes ago
        trafficLevel: 'moderate'
      };
    }
  }
}

export default new PlacesService();