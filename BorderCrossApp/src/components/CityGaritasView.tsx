import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PlacesService, { BorderCrossingLocation } from '../services/PlacesService';
import ModernIcon from './ModernIcon';
import ModernButton from './ModernButton';

interface CityGaritasViewProps {
  userLocation: { latitude: number; longitude: number };
  onCrossingSelect: (crossing: BorderCrossingLocation) => void;
  onGetDirections: (crossing: BorderCrossingLocation) => void;
  loadingDirections?: string;
}

type CrossingWithRecommendation = BorderCrossingLocation & {
  distance: number;
  distanceText: string;
  recommendation: 'best' | 'fastest' | 'nearest' | 'normal';
  recommendationReason: string;
};

const CityGaritasView: React.FC<CityGaritasViewProps> = ({
  userLocation,
  onCrossingSelect,
  onGetDirections,
  loadingDirections,
}) => {
  const { theme } = useTheme();
  const [userCity, setUserCity] = useState<string>('');
  const [crossings, setCrossings] = useState<CrossingWithRecommendation[]>([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectCityAndLoadCrossings();
  }, [userLocation]);

  const detectCityAndLoadCrossings = async () => {
    setLoadingCity(true);
    setError(null);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loadingCity) {
        console.log('⚠️ City detection timeout, using fallback');
        setUserCity('San Diego');
        const fallbackCrossings = PlacesService.getCrossingsWithRecommendations(userLocation);
        setCrossings(fallbackCrossings);
        setLoadingCity(false);
        setError('Location detection timed out, showing nearby crossings');
      }
    }, 8000);

    try {
      console.log('🔍 Detecting city for coordinates:', userLocation);
      
      const city = await Promise.race([
        PlacesService.detectUserCity(userLocation.latitude, userLocation.longitude),
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('City detection timeout')), 6000)
        )
      ]);
      
      clearTimeout(timeoutId);
      setUserCity(city || 'San Diego');
      
      const recommendedCrossings = PlacesService.getCrossingsWithRecommendations(
        userLocation,
        city || 'San Diego'
      );
      setCrossings(recommendedCrossings);
      
      console.log(`📍 User detected in: ${city || 'San Diego'}`);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error detecting city:', error);
      
      // Use coordinate-based fallback
      let fallbackCity = 'San Diego';
      const { latitude, longitude } = userLocation;
      
      if (latitude >= 32.5 && latitude <= 32.6 && longitude >= -116.7 && longitude <= -116.5) {
        fallbackCity = 'Tecate';
      } else if (latitude >= 32.6 && latitude <= 32.8 && longitude >= -115.6 && longitude <= -115.3) {
        fallbackCity = 'Mexicali';
      }
      
      setUserCity(fallbackCity);
      setError('Using approximate location based on coordinates');
      
      // Show all crossings sorted by wait time as fallback
      const allCrossings = PlacesService.getCrossingsWithRecommendations(userLocation);
      setCrossings(allCrossings);
    } finally {
      setLoadingCity(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'best': return '#4CAF50';
      case 'fastest': return '#2196F3';
      case 'nearest': return '#FF9800';
      default: return theme.colors.textSecondary;
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'best': return '⭐';
      case 'fastest': return '⚡';
      case 'nearest': return '📍';
      default: return '';
    }
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 15) return '#4CAF50';
    if (waitTime <= 30) return '#FF9800';
    if (waitTime <= 60) return '#FF5722';
    return '#F44336';
  };

  const getGateStatusColor = (crossing: BorderCrossingLocation) => {
    const isOpen = PlacesService.isGateOpen(crossing);
    return isOpen ? '#4CAF50' : '#F44336';
  };

  const handleCrossingPress = (crossing: BorderCrossingLocation) => {
    Alert.alert(
      `${crossing.name}`,
      `Wait Time: ${crossing.averageWaitTime} minutes\nDistance: ${(crossing as CrossingWithRecommendation).distanceText}\n\nWhat would you like to do?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '🗺️ View on Map', 
          onPress: () => onCrossingSelect(crossing)
        },
        { 
          text: '🧭 Get Directions', 
          onPress: () => onGetDirections(crossing)
        },
      ]
    );
  };

  if (loadingCity) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Detecting your location...
          </Text>
          <ModernButton
            title="Skip & Use Default Location"
            onPress={() => {
              setLoadingCity(false);
              setUserCity('San Diego');
              setError('Using default location');
              const fallbackCrossings = PlacesService.getCrossingsWithRecommendations(userLocation);
              setCrossings(fallbackCrossings);
            }}
            variant="primary"
            size="medium"
            icon="location-outline"
            iconFamily="ionicons"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ModernIcon name="location-outline" size={28} color={theme.colors.primary} family="ionicons" />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Border Crossings
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your location: {userCity}
        </Text>
        {error && (
          <View style={styles.errorContainer}>
            <ModernIcon name="warning-outline" size={14} color="#FFD93D" family="ionicons" />
            <Text style={[styles.errorText, { color: '#FFD93D' }]}>
              {error}
            </Text>
          </View>
        )}
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sorted by distance • Closest first
        </Text>
      </View>

      {crossings.map((crossing, index) => {
        const isLoadingDirections = loadingDirections === crossing.id;
        const isOpen = PlacesService.isGateOpen(crossing);

        return (
          <TouchableOpacity
            key={crossing.id}
            style={[
              styles.crossingCard,
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => handleCrossingPress(crossing)}
            disabled={isLoadingDirections}
          >
            {/* Recommendation Badge */}
            {crossing.recommendation !== 'normal' && (
              <View style={[
                styles.recommendationBadge,
                { backgroundColor: getRecommendationColor(crossing.recommendation) }
              ]}>
                <Text style={styles.recommendationText}>
                  {getRecommendationIcon(crossing.recommendation)} {crossing.recommendation.toUpperCase()}
                </Text>
              </View>
            )}

            {/* Crossing Header */}
            <View style={styles.crossingHeader}>
              <View style={styles.crossingInfo}>
                <Text style={[styles.crossingName, { color: theme.colors.text }]}>
                  {crossing.name}
                </Text>
                <Text style={[styles.crossingCity, { color: theme.colors.textSecondary }]}>
                  {crossing.city} • {crossing.distanceText}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getGateStatusColor(crossing) }]} />
                <Text style={[styles.statusText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
                  {isOpen ? 'OPEN' : 'CLOSED'}
                </Text>
              </View>
            </View>

            {/* Wait Time - Main Focus */}
            <View style={[styles.waitTimeContainer, { backgroundColor: `${getWaitTimeColor(crossing.averageWaitTime)}20` }]}>
              <View style={styles.waitTimeContent}>
                <ModernIcon name="time-outline" size={20} color={getWaitTimeColor(crossing.averageWaitTime)} family="ionicons" />
                <View style={styles.waitTimeText}>
                  <Text style={[styles.waitTimeLabel, { color: theme.colors.textSecondary }]}>
                    Current Wait Time
                  </Text>
                  <Text style={[
                    styles.waitTimeValue,
                    { color: getWaitTimeColor(crossing.averageWaitTime) }
                  ]}>
                    {crossing.averageWaitTime} minutes
                  </Text>
                </View>
                <View style={[styles.waitTimeCircle, { 
                  backgroundColor: getWaitTimeColor(crossing.averageWaitTime),
                  borderColor: getWaitTimeColor(crossing.averageWaitTime) 
                }]}>
                  <Text style={styles.waitTimeCircleText}>{crossing.averageWaitTime}</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <ModernIcon name="car-outline" size={16} color={theme.colors.textSecondary} family="ionicons" />
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Lanes</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {crossing.waitingLines?.length || 0}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <ModernIcon name="time-outline" size={16} color={theme.colors.textSecondary} family="ionicons" />
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Hours</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {crossing.operatingHours.is24Hours ? '24/7' : `${crossing.operatingHours.open}-${crossing.operatingHours.close}`}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <ModernIcon name="location-outline" size={16} color={theme.colors.textSecondary} family="ionicons" />
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Last Car</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {crossing.lastCarPosition 
                    ? `${Math.floor((Date.now() - crossing.lastCarPosition.timestamp.getTime()) / 60000)}m ago`
                    : 'No data'
                  }
                </Text>
              </View>
            </View>

            {/* Recommendation Reason */}
            {crossing.recommendation !== 'normal' && (
              <Text style={[styles.recommendationReason, { color: theme.colors.textSecondary }]}>
                💡 {crossing.recommendationReason}
              </Text>
            )}

            {/* Action Indicator */}
            <View style={styles.actionIndicator}>
              {isLoadingDirections ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                  Tap for options →
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          💡 Sorted by distance • Recommendations based on wait times and gate status
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  crossingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  recommendationBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  crossingCity: {
    fontSize: 12,
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
    fontSize: 10,
    fontWeight: '600',
  },
  waitTimeContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  waitTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waitTimeText: {
    flex: 1,
  },
  waitTimeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  waitTimeValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  waitTimeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitTimeCircleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationReason: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  actionIndicator: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CityGaritasView;