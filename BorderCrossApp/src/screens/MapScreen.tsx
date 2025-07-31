import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';

import { GOOGLE_MAPS_API_KEY } from '../config/maps';
import PlacesService, { BorderCrossingLocation, TrafficData, WaitingLine } from '../services/PlacesService';
import CarTracker, { CarPosition } from '../components/CarTracker';
import BorderCrossingList from '../components/BorderCrossingList';
import CityGaritasView from '../components/CityGaritasView';
import Geolocation from 'react-native-geolocation-service';

const MapScreen: React.FC = () => {
  console.log('🗺️ MapScreen component starting to render...');
  const { theme } = useTheme();
  const [region] = useState({
    latitude: 32.5349, // Tijuana latitude
    longitude: -117.0382, // Tijuana longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [borderCrossings, setBorderCrossings] = useState<BorderCrossingLocation[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [showWaitingLines, setShowWaitingLines] = useState(true);
  const [selectedCrossing, setSelectedCrossing] = useState<BorderCrossingLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [carPositions, setCarPositions] = useState<CarPosition[]>([]);
  const [showCarTracker, setShowCarTracker] = useState(false);
  const [showCrossingsList, setShowCrossingsList] = useState(false);
  const [showCityGaritas, setShowCityGaritas] = useState(false);
  const [isInfoCardExpanded, setIsInfoCardExpanded] = useState(false);
  const [isInfoCardExpanded, setIsInfoCardExpanded] = useState(false);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [loadingDirections, setLoadingDirections] = useState<string | null>(null);
  const placesService = PlacesService; // Trivial change to force re-compilation // Trivial change to force re-compilation

  useEffect(() => {
    console.log('🗺️ Google Maps API Key loaded:', !!GOOGLE_MAPS_API_KEY);
    console.log('🗺️ Platform:', Platform.OS);
    
    // Load border crossing locations (static data, no API calls)
    const crossings = placesService.getBorderCrossingLocations();
    setBorderCrossings(crossings);
    console.log('📍 Loaded', crossings.length, 'border crossings with static coordinates');
    console.log('📍 Sample crossing:', crossings[0]?.name, 'at', crossings[0]?.coordinate);
    
    // Load initial traffic data (database-driven, no Distance Matrix API)
    loadTrafficData();
    
    // Get user location
    getCurrentLocation();
  }, [loadTrafficData]);

  // Auto-show city garitas when user location is available
  useEffect(() => {
    if (userLocation && !selectedCrossing && !showCityGaritas && !showCrossingsList) {
      setShowCityGaritas(true);
    }
  }, [userLocation, selectedCrossing, showCityGaritas, showCrossingsList]);

  const getCurrentLocation = () => {
    console.log('🔍 Requesting location permission...');
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        console.log('📍 User location obtained:', latitude, longitude);
      },
      (error) => {
        console.error('Location error:', error);
        
        // Set a default location (San Diego area) as fallback
        const defaultLocation = { latitude: 32.5349, longitude: -117.0382 };
        setUserLocation(defaultLocation);
        
        console.log('📍 Using default location (San Diego area)');
        
        Alert.alert(
          'Location Access',
          'Unable to get your exact location. Using San Diego area as default. Please enable location services for better accuracy.',
          [{ text: 'OK' }]
        );
      },
      {
        enableHighAccuracy: false, // Reduced accuracy for faster response
        timeout: 10000, // Reduced timeout
        maximumAge: 30000, // Allow cached location
      }
    );

    // Fallback timeout to prevent infinite loading
    setTimeout(() => {
      if (!userLocation) {
        console.log('⚠️ Location timeout, using default location');
        const defaultLocation = { latitude: 32.5349, longitude: -117.0382 };
        setUserLocation(defaultLocation);
      }
    }, 12000);
  };

  const loadTrafficData = useCallback(async () => {
    setLoadingTraffic(true);
    try {
      console.log('🚦 Loading traffic data (database-driven, no expensive APIs)...');
      const traffic = await placesService.getTrafficDataForBorderCrossings();
      setTrafficData(traffic);
      console.log('✅ Traffic data loaded successfully:', traffic.length, 'crossings');
    } catch (error) {
      console.error('❌ Error loading traffic data:', error);
      // Show user-friendly error
      Alert.alert(
        'Traffic Data Error', 
        'Unable to load current traffic data. Using estimated values.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingTraffic(false);
    }
  }, []);

  const getCongestionColor = (congestionLevel: string) => {
    switch (congestionLevel) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'heavy': return '#FF5722';
      case 'severe': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getTrafficDataForCrossing = (placeId: string) => {
    return trafficData.find(data => data.placeId === placeId);
  };

  const handleCarPositionUpdate = (position: CarPosition) => {
    setCarPositions(prev => {
      const filtered = prev.filter(p => p.waitingLineId !== position.waitingLineId);
      return [...filtered, position];
    });
  };

  const handleCrossingSelect = (crossing: BorderCrossingLocation) => {
    // Zoom to the selected crossing
    if (mapRef) {
      mapRef.animateToRegion({
        latitude: crossing.coordinate.latitude,
        longitude: crossing.coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
    
    setSelectedCrossing(crossing);
    setShowCrossingsList(false);
    setShowCityGaritas(false);
    
    console.log(`🎯 Zoomed to ${crossing.name}`);
  };

  const handleViewOnMap = (crossing: BorderCrossingLocation) => {
    handleCrossingSelect(crossing);
  };

  const showDirectionOptions = (crossing: BorderCrossingLocation) => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to get directions.');
      return;
    }

    Alert.alert(
      `🏛️ ${crossing.name}`,
      `📍 Distance: ${calculateDistanceText(crossing)}\n⏱️ Wait Time: ${crossing.averageWaitTime} minutes\n🚪 Status: ${placesService.isGateOpen(crossing) ? 'Open' : 'Closed'}\n\nChoose your action:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '🧭 Get Directions', 
          onPress: () => handleGetDirections(crossing)
        },
        { 
          text: '🚗 Start Car Tracking', 
          onPress: () => {
            setShowCarTracker(true);
            setSelectedCrossing(crossing);
          }
        },
        { 
          text: '📊 View Details', 
          onPress: () => {
            // Show detailed info in the info panel
            setSelectedCrossing(crossing);
          }
        },
      ]
    );
  };

  const calculateDistanceText = (crossing: BorderCrossingLocation): string => {
    if (!userLocation) return 'Unknown';
    
    const R = 6371; // Earth's radius in km
    const dLat = (crossing.coordinate.latitude - userLocation.latitude) * Math.PI / 180;
    const dLon = (crossing.coordinate.longitude - userLocation.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(crossing.coordinate.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const handleGetDirections = async (crossing: BorderCrossingLocation) => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location services to get directions.');
      return;
    }

    setLoadingDirections(crossing.id);
    
    try {
      const directions = await placesService.getDirections(userLocation, crossing.coordinate);
      
      if (directions) {
        const route = directions.legs[0];
        const duration = route.duration.text;
        const distance = route.distance.text;
        
        Alert.alert(
          'Directions to ' + crossing.name,
          `Distance: ${distance}\nEstimated time: ${duration}\n\nWould you like to open this in your navigation app?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Maps', 
              onPress: () => {
                // This would open the native maps app with directions
                console.log('🗺️ Opening directions in native maps app');
                // In a real app, you might use react-native-maps-directions or linking to open maps
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to get directions to this location.');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Error', 'Failed to get directions. Please try again.');
    } finally {
      setLoadingDirections(null);
    }
  };

  const onMapReady = () => {
    console.log('✅ Google Maps is ready!');
  };

  const onMapError = (error: any) => {
    console.error('❌ Google Maps error:', error);
    Alert.alert('Map Error', 'Failed to load Google Maps. Error: ' + JSON.stringify(error));
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Map Configuration Error
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            Google Maps API key not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {console.log(`MapScreen render: showCrossingsList=${showCrossingsList}, showCityGaritas=${showCityGaritas}`)}
      <View style={styles.mapContainer}>
        <MapView
          ref={setMapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          onMapReady={onMapReady}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={false}
          showsTraffic={true}
          onError={onMapError}
        >
          {(selectedCrossing ? [selectedCrossing] : borderCrossings).map((crossing) => {
            const traffic = getTrafficDataForCrossing(crossing.placeId);
            
            // Validate coordinate data
            if (!crossing.coordinate || 
                typeof crossing.coordinate.latitude !== 'number' || 
                typeof crossing.coordinate.longitude !== 'number') {
              console.warn('⚠️ Invalid coordinates for crossing:', crossing.name);
              return null;
            }
            
            return (
              <React.Fragment key={crossing.id}>
                <Marker
                  coordinate={crossing.coordinate}
                  title={crossing.name}
                  description={`${crossing.address}${traffic ? ` - ${traffic.congestionLevel.toUpperCase()} traffic` : ' - Using static data'}`}
                  onPress={() => handleCrossingSelect(crossing)}
                >
                  <View style={[
                    styles.customMarker,
                    { backgroundColor: traffic ? getCongestionColor(traffic.congestionLevel) : theme.colors.primary }
                  ]}>
                    <Text style={styles.markerText}>🏛️</Text>
                  </View>
                </Marker>
                
                {/* Traffic indicator circle */}
                {traffic && (
                  <Circle
                    center={crossing.coordinate}
                    radius={200}
                    fillColor={`${getCongestionColor(traffic.congestionLevel)}40`}
                    strokeColor={getCongestionColor(traffic.congestionLevel)}
                    strokeWidth={2}
                  />
                )}
                
                {/* Waiting lines markers */}
                {showWaitingLines && crossing.waitingLines?.map((line) => {
                  // Validate line coordinate data
                  if (!line.coordinate || 
                      typeof line.coordinate.latitude !== 'number' || 
                      typeof line.coordinate.longitude !== 'number') {
                    console.warn('⚠️ Invalid line coordinates for:', line.name);
                    return null;
                  }
                  
                  return (
                    <Marker
                      key={line.id}
                      coordinate={line.coordinate}
                      title={line.name}
                      description={`${line.type} lane${line.estimatedWaitTime ? ` - ~${line.estimatedWaitTime} min wait` : ''}`}
                    >
                      <View style={[styles.lineMarker, { backgroundColor: line.type === 'vehicle' ? '#2196F3' : '#9C27B0' }]}>
                        <Text style={styles.lineMarkerText}>
                          {line.type === 'vehicle' ? '🚗' : '🚶'}
                        </Text>
                      </View>
                    </Marker>
                  );
                })}
                
                {/* Car position markers */}
                {carPositions
                  .filter(pos => crossing.waitingLines?.some(line => line.id === pos.waitingLineId))
                  .map((carPos) => (
                    <Marker
                      key={carPos.id}
                      coordinate={carPos.coordinate}
                      title="Car in Line"
                      description={`Wait time: ~${carPos.estimatedWaitTime || 0} min`}
                    >
                      <View style={styles.carMarker}>
                        <Text style={styles.carMarkerText}>🚗</Text>
                      </View>
                    </Marker>
                  ))}
              </React.Fragment>
            );
          })}
        </MapView>
        

        {/* Car Tracker */}
        {showCarTracker && selectedCrossing && (
          <View style={[styles.carTrackerContainer, { backgroundColor: theme.colors.background }]}>
            <CarTracker
              waitingLines={selectedCrossing.waitingLines || []}
              onCarPositionUpdate={handleCarPositionUpdate}
              userLocation={userLocation || undefined}
            />
          </View>
        )}

        {/* Border Crossings List */}
        {showCrossingsList && (
          <View style={[styles.crossingsListContainer, { backgroundColor: theme.colors.background }]}>
            <BorderCrossingList
              crossings={borderCrossings}
              onCrossingSelect={handleCrossingSelect}
              onGetDirections={handleGetDirections}
              onViewOnMap={handleViewOnMap}
              userLocation={userLocation || undefined}
              loadingDirections={loadingDirections || undefined}
            />
          </View>
        )}

        {/* City Garitas View */}
        {showCityGaritas && userLocation && (
          <View style={[styles.crossingsListContainer, { backgroundColor: theme.colors.background }]}>
            <CityGaritasView
              userLocation={userLocation}
              onCrossingSelect={handleCrossingSelect}
              onGetDirections={handleGetDirections}
              onViewOnMap={handleViewOnMap}
              loadingDirections={loadingDirections || undefined}
            />
          </View>
        )}

        {/* Info Container */}
        {!showCrossingsList && !showCityGaritas && (
          <View style={[
            styles.infoContainer, 
            { 
              backgroundColor: theme.colors.card,
              bottom: showCarTracker && selectedCrossing ? 260 : 40
            }
          ]}>
          {selectedCrossing ? (
            <View>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                {selectedCrossing.name}
              </Text>
              <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => handleGetDirections(selectedCrossing)} style={styles.actionIcon}>
                  <Text>🧭</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCarTracker(true)} style={styles.actionIcon}>
                  <Text>🚗</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedCrossing(null)} style={styles.actionIcon}>
                  <Text>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                Border Crossings Map
              </Text>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Showing {borderCrossings.length} border crossings with live traffic data
              </Text>
              <Text style={[styles.infoSubtext, { color: theme.colors.textSecondary }]}>
                Tap on a crossing for more details
              </Text>
            </View>
          )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controlPanel: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 16,
  },
  lineMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineMarkerText: {
    fontSize: 12,
  },
  carMarker: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#FF5722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carMarkerText: {
    fontSize: 10,
  },
  carTrackerContainer: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    maxHeight: 200,
    borderRadius: 12,
  },
  crossingsListContainer: {
    position: 'absolute',
    top: 140,
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: '50%',
    padding: 10, // Reduced padding
    borderRadius: 12,
    maxHeight: isInfoCardExpanded ? 200 : 80, // Dynamic height
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoSubtext: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  trafficInfo: {
    marginVertical: 8,
  },
  trafficText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionIcon: {
    padding: 6, // Reduced padding
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MapScreen;