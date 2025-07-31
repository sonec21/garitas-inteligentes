import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PlacesService, { BorderCrossingLocation } from '../services/PlacesService';

interface BorderCrossingListProps {
  crossings: BorderCrossingLocation[];
  onCrossingSelect: (crossing: BorderCrossingLocation) => void;
  onGetDirections: (crossing: BorderCrossingLocation) => void;
  onViewOnMap: (crossing: BorderCrossingLocation) => void; // Added this line
  userLocation?: { latitude: number; longitude: number };
  loadingDirections?: string; // crossing id that's loading directions
}

const BorderCrossingList: React.FC<BorderCrossingListProps> = ({
  crossings,
  onCrossingSelect,
  onGetDirections,
  onViewOnMap,
  userLocation,
  loadingDirections,
}) => {
  const { theme } = useTheme();
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

  const crossingsByCity = PlacesService.getBorderCrossingsByCity();

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 15) return '#4CAF50'; // Green
    if (waitTime <= 30) return '#FF9800'; // Orange
    if (waitTime <= 60) return '#FF5722'; // Red
    return '#F44336'; // Dark Red
  };

  const getGateStatusColor = (crossing: BorderCrossingLocation) => {
    const isOpen = PlacesService.isGateOpen(crossing);
    return isOpen ? '#4CAF50' : '#F44336';
  };

  const getGateStatusText = (crossing: BorderCrossingLocation) => {
    const isOpen = PlacesService.isGateOpen(crossing);
    if (crossing.operatingHours.is24Hours) {
      return isOpen ? '24/7 Open' : 'Closed';
    }
    return isOpen 
      ? `Open (${crossing.operatingHours.open} - ${crossing.operatingHours.close})`
      : `Closed (${crossing.operatingHours.open} - ${crossing.operatingHours.close})`;
  };

  const getLastCarInfo = (crossing: BorderCrossingLocation) => {
    if (!crossing.lastCarPosition) return 'No recent data';
    
    const minutesAgo = Math.floor((Date.now() - crossing.lastCarPosition.timestamp.getTime()) / 60000);
    return `${minutesAgo} min ago`;
  };

  const calculateDistance = (crossing: BorderCrossingLocation) => {
    if (!userLocation) return null;
    
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

  const renderCrossingItem = (crossing: BorderCrossingLocation) => {
    const isOpen = PlacesService.isGateOpen(crossing);
    const distance = calculateDistance(crossing);
    const isLoadingDirections = loadingDirections === crossing.id;

    return (
      <View key={crossing.id} style={[styles.crossingItem, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.crossingHeader}
          onPress={() => onViewOnMap(crossing)}
        >
          <View style={styles.crossingInfo}>
            <Text style={[styles.crossingName, { color: theme.colors.text }]}>
              {crossing.name}
            </Text>
            <Text style={[styles.crossingAddress, { color: theme.colors.textSecondary }]}>
              {crossing.address}
              {distance && <Text style={styles.distance}> • {distance}</Text>}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getGateStatusColor(crossing) }]} />
            <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.crossingDetails}>
          {/* Wait Time */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              ⏱️ Avg Wait:
            </Text>
            <Text style={[
              styles.detailValue,
              { color: getWaitTimeColor(crossing.averageWaitTime) }
            ]}>
              {crossing.averageWaitTime} min
            </Text>
          </View>

          {/* Operating Hours */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              🕒 Hours:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {getGateStatusText(crossing)}
            </Text>
          </View>

          {/* Waiting Lines */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              🚗 Lines:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {crossing.waitingLines?.length || 0} lanes
            </Text>
          </View>

          {/* Last Car Position */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              📍 Last Car:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {getLastCarInfo(crossing)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => onViewOnMap(crossing)}
            >
              <Text style={styles.actionButtonText}>📍 View on Map</Text>
            </TouchableOpacity>
            
            {userLocation && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { 
                    backgroundColor: isLoadingDirections ? theme.colors.disabled : '#2196F3'
                  }
                ]}
                onPress={() => onGetDirections(crossing)}
                disabled={isLoadingDirections}
              >
                {isLoadingDirections ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>🧭 Directions</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🏛️ Border Crossings
      </Text>
      
      {Object.entries(crossingsByCity).map(([city, cityCrossings]) => (
        <View key={city} style={styles.citySection}>
          <TouchableOpacity
            style={[styles.cityHeader, { backgroundColor: theme.colors.background }]}
            onPress={() => setExpandedCity(expandedCity === city ? null : city)}
          >
            <Text style={[styles.cityName, { color: theme.colors.text }]}>
              📍 {city}
            </Text>
            <View style={styles.cityInfo}>
              <Text style={[styles.cityCount, { color: theme.colors.textSecondary }]}>
                {cityCrossings.length} crossing{cityCrossings.length !== 1 ? 's' : ''}
              </Text>
              <Text style={[styles.expandIcon, { color: theme.colors.primary }]}>
                {expandedCity === city ? '▼' : '▶'}
              </Text>
            </View>
          </TouchableOpacity>

          {expandedCity === city && (
            <View style={styles.cityContent}>
              {cityCrossings.map(renderCrossingItem)}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  citySection: {
    marginBottom: 12,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityCount: {
    fontSize: 12,
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: '600',
  },
  cityContent: {
    gap: 8,
  },
  crossingItem: {
    borderRadius: 12,
    padding: 16,
  },
  crossingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  crossingInfo: {
    flex: 1,
    marginRight: 12,
  },
  crossingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  crossingAddress: {
    fontSize: 12,
    lineHeight: 16,
  },
  distance: {
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  crossingDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BorderCrossingList;