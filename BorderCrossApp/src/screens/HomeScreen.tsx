import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import ModernIcon, { icons } from '../components/ModernIcon';
import { BorderCrossing, Lane } from '../types';
import { GaritaService } from '../services/borderService';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCrossings = useCallback(async () => {
    console.log('🏠 HomeScreen.loadCrossings called');
    setLoading(true);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Loading timeout reached, stopping loader');
      setLoading(false);
      setCrossings([]);
    }, 10000); // 10 second timeout
    
    try {
      console.log('📡 Fetching data from Supabase...');
      const data = await GaritaService.getBorderCrossings();

      clearTimeout(timeoutId); // Clear timeout since we got a response

      if (data && data.length > 0) {
        console.log(
          '✅ Supabase data loaded successfully:',
          data.length,
          'crossings',
        );
        console.log('📋 First crossing data:', JSON.stringify(data[0], null, 2));
        setCrossings(data);
      } else {
        console.log('⚠️ No data from Supabase, received:', data);
        setCrossings([]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Error loading crossings:', error);
      console.log('🔄 Displaying no data due to error');
      setCrossings([]);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  }, []);

  useEffect(() => {
    loadCrossings();
  }, [loadCrossings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCrossings();
    setRefreshing(false);
  };

  const getTrafficColor = (flow: string) => {
    switch (flow) {
      case 'fast':
        return theme.colors.success;
      case 'moderate':
        return theme.colors.warning;
      case 'slow':
        return theme.colors.error;
      default:
        return theme.colors.textTertiary;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'open' ? theme.colors.success : theme.colors.error;
  };

  const renderLane = (lane: Lane, crossing: BorderCrossing) => (
    <TouchableOpacity
      key={lane.id}
      style={[styles.laneContainer, { backgroundColor: theme.colors.surface }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('LaneSimulation', { lane, crossing })}
    >
      <View style={styles.laneHeader}>
        <Text style={[styles.laneName, { color: theme.colors.text }]}>
          {lane.name}
        </Text>
        <View style={styles.laneHeaderRight}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: getTrafficColor(lane.traffic_flow) + '20',
                borderColor: getTrafficColor(lane.traffic_flow),
              },
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                { color: getTrafficColor(lane.traffic_flow) },
              ]}
            >
              {lane.traffic_flow}
            </Text>
          </View>
          <ModernIcon 
            name="chevron-forward-outline" 
            size={20} 
            color={theme.colors.textTertiary}
            family="ionicons"
          />
        </View>
      </View>
      <View style={styles.laneStats}>
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.accent + '20' },
            ]}
          >
            <ModernIcon
              name="timer-outline"
              size={28}
              color={theme.colors.accent}
              family="ionicons"
            />
          </View>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Wait Time
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {lane.wait_time} min
          </Text>
        </View>
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.accent + '20' },
            ]}
          >
            <ModernIcon
              name="car-outline"
              size={28}
              color={theme.colors.accent}
              family="ionicons"
            />
          </View>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Vehicles
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {lane.vehicle_count}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCrossing = (crossing: BorderCrossing) => (
    <TouchableOpacity
      key={crossing.id}
      style={[styles.crossingCard, { backgroundColor: theme.colors.card }]}
      activeOpacity={0.8}
    >
      <View style={styles.crossingHeader}>
        <View style={styles.crossingTitleContainer}>
          <Text style={[styles.crossingTitle, { color: theme.colors.text }]}>
            {crossing.name}
          </Text>
          <Text
            style={[
              styles.crossingSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Border Crossing
          </Text>
        </View>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: getStatusColor(crossing.status) + '20',
              borderColor: getStatusColor(crossing.status),
            },
          ]}
        >
          <Text
            style={[
              styles.statusChipText,
              { color: getStatusColor(crossing.status) },
            ]}
          >
            {crossing.status}
          </Text>
        </View>
      </View>

      <View style={styles.lanesContainer}>
        {crossing.lanes.map((lane) => renderLane(lane, crossing))}
      </View>

      <View style={styles.cardFooter}>
        <Text
          style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}
        >
          Last updated: {new Date(crossing.lastUpdated).toLocaleTimeString()}
        </Text>
        <TouchableOpacity
          style={[
            styles.viewMoreButton,
            { backgroundColor: theme.colors.accent },
          ]}
        >
          <Text style={[styles.viewMoreText, { color: theme.colors.card }]}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading border crossings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Border Crossings
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Real-time wait times and status
          </Text>
        </View>

        <View style={styles.content}>
          {crossings.length > 0 ? (
            crossings.map(renderCrossing)
          ) : (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyStateText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No border crossings available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  crossingCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  crossingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  crossingTitleContainer: {
    flex: 1,
  },
  crossingTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
  },
  crossingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  statusChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  lanesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  laneContainer: {
    borderRadius: 12,
    padding: 16,
  },
  laneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  laneName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  laneHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  laneStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
  },
  lastUpdated: {
    fontSize: 12,
    flex: 1,
  },
  viewMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
