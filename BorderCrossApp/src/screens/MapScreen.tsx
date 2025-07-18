import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { BorderCrossing } from '../types';
import { GaritaService } from '../services/borderService';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';

const MapScreen = () => {
  const { theme } = useTheme();
  const [region, setRegion] = useState({
    latitude: 32.5422,
    longitude: -117.0309,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCrossing, setSelectedCrossing] =
    useState<BorderCrossing | null>(null);
  const [borderCrossings, setBorderCrossings] = useState<BorderCrossing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBorderCrossings = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🗺️ MapScreen: Loading border crossings from Supabase...');
      const data = await GaritaService.getBorderCrossings();

      if (data && data.length > 0) {
        console.log(
          '✅ MapScreen: Supabase data loaded successfully:',
          data.length,
          'crossings',
        );
        setBorderCrossings(data);
      } else {
        console.log('⚠️ MapScreen: No data from Supabase');
        setBorderCrossings([]);
      }
    } catch (error) {
      console.error('❌ MapScreen: Error loading crossings:', error);
      setBorderCrossings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
    loadBorderCrossings();
  }, [loadBorderCrossings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBorderCrossings();
    setRefreshing(false);
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      },
      error => {
        console.log('Location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'open':
        return theme.colors.success;
      case 'closed':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const getFastestLane = (crossing: BorderCrossing) => {
    return crossing.lanes.reduce((fastest, lane) =>
      lane.wait_time < fastest.wait_time ? lane : fastest,
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading map data...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.accent]}
              tintColor={theme.colors.accent}
            />
          }
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {userLocation && (
              <Marker coordinate={userLocation} pinColor="blue" title="My Location" />
            )}
            {borderCrossings.map(crossing => (
              <Marker
                key={crossing.id}
                coordinate={crossing.location}
                title={crossing.name}
                description={`Status: ${crossing.status}`}
                pinColor={getMarkerColor(crossing.status)}
                onPress={() => setSelectedCrossing(crossing)}
              />
            ))}
          </MapView>
        </ScrollView>
      )}

      {!loading && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.colors.accent }]} 
          onPress={getCurrentLocation}
        >
          <Icon name="location" size={24} color={theme.colors.card} />
        </TouchableOpacity>
      )}

      {!loading && selectedCrossing && (
        <View style={[styles.bottomCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {selectedCrossing.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCrossing(null)}
                style={styles.closeButton}
              >
                <Icon name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.laneInfo}>
              <Text style={[styles.fastestLaneTitle, { color: theme.colors.textSecondary }]}>
                Fastest Lane:
              </Text>
              <Text style={[styles.fastestLaneName, { color: theme.colors.text }]}>
                {getFastestLane(selectedCrossing).name}
              </Text>
              <Text style={[styles.waitTime, { color: theme.colors.accent }]}>
                {getFastestLane(selectedCrossing).wait_time} min wait
              </Text>
            </View>

            <TouchableOpacity style={[styles.routeButton, { backgroundColor: theme.colors.accent }]}>
              <Icon name="location" size={20} color={theme.colors.card} />
              <Text style={[styles.routeButtonText, { color: theme.colors.card }]}>
                Get Directions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  laneInfo: {
    marginBottom: 16,
  },
  fastestLaneTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  fastestLaneName: {
    fontSize: 18,
    fontWeight: '600',
  },
  waitTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  routeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollViewContent: {
    flex: 1, // Ensure ScrollView takes full height
  },
});

export default MapScreen;