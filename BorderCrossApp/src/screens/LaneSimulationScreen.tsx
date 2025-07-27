import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from '../components/Icon';
import { BorderCrossing, Lane } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LaneSimulationScreenProps {
  route: {
    params: {
      lane: Lane;
      crossing: BorderCrossing;
    };
  };
  navigation: any;
}

interface SimulatedCar {
  id: string;
  type: 'car' | 'truck' | 'motorcycle';
  color: string;
  position: number; // 0-100, where 100 is at the border gate
  lane: 'left' | 'right'; // Which lane the car is in
  gateNumber?: number; // Which gate the car will use (1-4)
  isUserCar?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const SIMULATION_WIDTH = screenWidth - 40;
const CAR_WIDTH = 50;
const CAR_HEIGHT = 30;
const LANE_WIDTH = CAR_WIDTH + 20; // Lane is car width + some padding
const TOTAL_LANES_WIDTH = LANE_WIDTH * 2;

const LaneSimulationScreen: React.FC<LaneSimulationScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const { lane, crossing } = route.params;
  
  const [cars, setCars] = useState<SimulatedCar[]>([]);
  const [userPosition, setUserPosition] = useState(0);
  const [lastCarLocation, setLastCarLocation] = useState('');
  const animationRef = useRef<Animated.Value>(new Animated.Value(0));

  // Generate simulated cars based on lane traffic
  useEffect(() => {
    generateSimulatedCars();
    generateLastCarLocation();
    startAnimation();
  }, [lane]);

  const generateSimulatedCars = () => {
    // Calculate available space: simulation height (450px) - gate area (180px) - starting line (50px) = 220px
    // Each car needs 40px spacing, so max cars = 220px / 40px = 5.5, round down to 5
    const maxCarsPerLane = 5; // Conservative limit to prevent overlap
    const totalCars = Math.min(lane.vehicle_count, 10); // Max 10 total (5 per lane)
    const carsData: SimulatedCar[] = [];
    
    const carColors = ['#6B7280', '#9CA3AF', '#D1D5DB']; // Grayscale like the screenshot
    
    // Split cars between two lanes
    const leftLaneCars = Math.min(Math.ceil(totalCars / 2), maxCarsPerLane);
    const rightLaneCars = Math.min(totalCars - leftLaneCars, maxCarsPerLane);
    
    // Generate cars for left lane
    for (let i = 0; i < leftLaneCars; i++) {
      carsData.push({
        id: `left-car-${i}`,
        type: 'car',
        color: carColors[Math.floor(Math.random() * carColors.length)],
        position: i, // Just use index for simple stacking
        lane: 'left',
        isUserCar: i === 2, // User car at 3rd position
      });
    }
    
    // Generate cars for right lane
    for (let i = 0; i < rightLaneCars; i++) {
      carsData.push({
        id: `right-car-${i}`,
        type: 'car',
        color: carColors[Math.floor(Math.random() * carColors.length)],
        position: i, // Just use index for simple stacking
        lane: 'right',
        isUserCar: !carsData.some(car => car.isUserCar) && i === 2,
      });
    }
    
    setCars(carsData);
    
    // Set user position based on user car
    const userCar = carsData.find(car => car.isUserCar);
    if (userCar) {
      setUserPosition(userCar.position);
    }
  };

  const getVehicleSpacing = (vehicleType: string): number => {
    switch (vehicleType) {
      case 'truck':
        return 12; // Trucks need more space
      case 'motorcycle':
        return 4; // Motorcycles need less space
      default:
        return 8; // Standard car spacing
    }
  };

  const generateLastCarLocation = () => {
    // Simulate last car location - in real app this would come from Google Places API
    const locations = [
      'Mesa de Otay East, Tijuana',
      'Av. Internacional, Tijuana',
      'Blvd. Industrial, Tijuana',
      'Via Rapida Oriente, Tijuana',
      'Carr. Libre Tijuana-Tecate, Tijuana'
    ];
    
    setLastCarLocation(locations[Math.floor(Math.random() * locations.length)]);
  };

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationRef.current, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animationRef.current, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getCarIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return 'truck';
      case 'motorcycle':
        return 'car-simple';
      default:
        return 'car';
    }
  };

  const getPositionText = () => {
    const carsAhead = cars.filter(car => car.position > userPosition).length;
    return carsAhead;
  };

  const getEstimatedWaitTime = () => {
    const carsAhead = getPositionText();
    const baseTime = lane.wait_time;
    const adjustedTime = Math.max(1, baseTime - (20 - carsAhead) * 0.5);
    return Math.round(adjustedTime);
  };

  const renderBorderGate = () => (
    <View style={styles.borderGateArea}>
      {/* US Inspection Gates Label */}
      <Text style={[styles.usInspectionLabel, { color: theme.colors.text }]}>
        US Inspection Gates
      </Text>
      
      {/* Individual inspection gates */}
      <View style={styles.inspectionGates}>
        {[1, 1, 1, 1].map((_, index) => (
          <View key={index} style={styles.gateColumn}>
            <Text style={[styles.gateLabel, { color: theme.colors.textSecondary }]}>
              Gate 1
            </Text>
            <View style={[styles.gate, { 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.textTertiary,
              borderWidth: 2 
            }]}>
              {/* Car underneath gate */}
              <View style={[styles.gateCircle, { 
                backgroundColor: '#9CA3AF',
                borderColor: 'transparent',
                borderWidth: 0
              }]} />
            </View>
          </View>
        ))}
      </View>
      
      {/* No cars at gates - clean layout */}
    </View>
  );

  const renderLaneLines = () => {
    const centerX = SIMULATION_WIDTH / 2;
    const laneWidth = 30; // Exact width matching screenshot
    const spacing = 15; // Minimal gap between lanes
    const leftLaneCenter = centerX - spacing;
    const rightLaneCenter = centerX + spacing;
    
    return (
      <View style={styles.laneContainer}>
        {/* Left Lane Boundary */}
        <View style={[styles.laneVerticalLine, { 
          left: leftLaneCenter - laneWidth/2, 
          backgroundColor: theme.colors.textTertiary + '90' 
        }]} />
        
        {/* Center divider - thin line */}
        <View style={[styles.laneVerticalLine, { 
          left: centerX - 0.5, 
          backgroundColor: theme.colors.textTertiary + '90',
          width: 1
        }]} />

        {/* Right Lane Boundary */}
        <View style={[styles.laneVerticalLine, { 
          left: rightLaneCenter + laneWidth/2, 
          backgroundColor: theme.colors.textTertiary + '90' 
        }]} />

        {/* Left Lane Cars - with proper gaps between cars */}
        <View style={[styles.queuedCar, { bottom: 30, left: leftLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.queuedCar, { bottom: 58, left: leftLaneCenter - 10, backgroundColor: '#6B7280' }]} />
        <View style={[styles.queuedCar, { bottom: 86, left: leftLaneCenter - 10, backgroundColor: '#D1D5DB' }]} />
        <View style={[styles.queuedCar, { bottom: 114, left: leftLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.queuedCar, { bottom: 142, left: leftLaneCenter - 10, backgroundColor: '#6B7280' }]} />
        <View style={[styles.queuedCar, { bottom: 170, left: leftLaneCenter - 10, backgroundColor: '#D1D5DB' }]} />
        <View style={[styles.queuedCar, { bottom: 198, left: leftLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.queuedCar, { bottom: 226, left: leftLaneCenter - 10, backgroundColor: '#6B7280' }]} />

        {/* Right Lane Cars - with proper gaps between cars */}
        <View style={[styles.queuedCar, { bottom: 30, left: rightLaneCenter - 10, backgroundColor: '#D1D5DB' }]} />
        <View style={[styles.queuedCar, { bottom: 58, left: rightLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.queuedCar, { bottom: 86, left: rightLaneCenter - 10, backgroundColor: '#6B7280' }]} />
        <View style={[styles.queuedCar, { bottom: 114, left: rightLaneCenter - 10, backgroundColor: '#2563EB' }]} /> {/* User car - blue */}
        <View style={[styles.queuedCar, { bottom: 142, left: rightLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />
        <View style={[styles.queuedCar, { bottom: 170, left: rightLaneCenter - 10, backgroundColor: '#D1D5DB' }]} />
        <View style={[styles.queuedCar, { bottom: 198, left: rightLaneCenter - 10, backgroundColor: '#6B7280' }]} />
        <View style={[styles.queuedCar, { bottom: 226, left: rightLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />

        {/* Cars approaching gates from lanes - with gaps */}
        <View style={[styles.queuedCar, { bottom: 260, left: leftLaneCenter - 10, backgroundColor: '#6B7280' }]} />
        <View style={[styles.queuedCar, { bottom: 270, left: rightLaneCenter - 10, backgroundColor: '#D1D5DB' }]} />
        <View style={[styles.queuedCar, { bottom: 290, left: leftLaneCenter - 10, backgroundColor: '#9CA3AF' }]} />

        {/* Starting Line Label */}
        <View style={styles.startingLineContainer}>
          <Text style={[styles.startingLineText, { color: theme.colors.textSecondary }]}>
            Starting Line
          </Text>
        </View>
      </View>
    );
  };

  const getLanePosition = (lane: 'left' | 'right') => {
    const startX = (SIMULATION_WIDTH - TOTAL_LANES_WIDTH) / 2; // Center the two lanes
    return lane === 'left' 
      ? startX + (LANE_WIDTH / 2) 
      : startX + LANE_WIDTH + (LANE_WIDTH / 2);
  };

  const getGatePosition = (gateNumber: number) => {
    // Gates are evenly spaced across the simulation width
    const gateSpacing = SIMULATION_WIDTH / 5; // 5 spaces for 4 gates
    return gateSpacing * gateNumber - (gateSpacing / 2);
  };

  // Simplified car rendering - cars are now rendered as circles in the lane lines

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {lane.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {crossing.name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: theme.colors.accent + '20' }]}>
          <Text style={[styles.statusText, { color: theme.colors.accent }]}>
            {lane.traffic_flow.toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Icon name="cars-multiple" size={24} color={theme.colors.accent} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {getPositionText()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Cars Ahead
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Icon name="clock" size={24} color={theme.colors.warning} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {getEstimatedWaitTime()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Minutes Left
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Icon name="car" size={24} color={theme.colors.success} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {lane.vehicle_count}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Vehicles
            </Text>
          </View>
        </View>

        {/* Lane Simulation */}
        <View style={[styles.simulationCard, { backgroundColor: theme.colors.card }]}>
 
          <View style={styles.simulationContainer}>
            {renderBorderGate()}
            {renderLaneLines()}
            
            {/* Side Facility Labels */}
            <View style={styles.facilitiesContainer}>
              <View style={styles.facilityLabel}>
                <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                  Mexican Dealer
                </Text>
              </View>
              <View style={styles.facilityLabel}>
                <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                  City Park
                </Text>
              </View>
              <View style={styles.facilityLabel}>
                <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                  Government Building
                </Text>
              </View>
              <View style={styles.facilityLabel}>
                <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                  Gas Station
                </Text>
              </View>
              <View style={styles.facilityLabel}>
                <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                  Business Name
                </Text>
              </View>
              <View style={styles.facilityLabel}>
                <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                  Business Name
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Last Car Location */}
        <View style={[styles.locationCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.locationHeader}>
            <Icon name="location" size={24} color={theme.colors.error} />
            <Text style={[styles.locationTitle, { color: theme.colors.text }]}>
              End of Queue
            </Text>
          </View>
          <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
            Last car in line is near:
          </Text>
          <Text style={[styles.locationAddress, { color: theme.colors.text }]}>
            {lastCarLocation}
          </Text>
          <TouchableOpacity 
            style={[styles.navigationButton, { backgroundColor: theme.colors.accent }]}
          >
            <Icon name="chevron-right" size={20} color="white" />
            <Text style={styles.navigationText}>Navigate to Queue End</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  simulationCard: {
    padding: 10,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  simulationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  simulationContainer: {
    height: 400, // Reduced height for better proportions
    position: 'relative',
  },
  laneContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  laneLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
  },
  leftBoundary: {
    left: 20,
  },
  rightBoundary: {
    right: 20,
  },
  centerDivider: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 3,
    flexDirection: 'column',
    justifyContent: 'space-around',
    transform: [{ translateX: -1.5 }],
    paddingVertical: 10,
  },
  centerDash: {
    width: 3,
    height: 12,
    marginVertical: 2,
  },
  laneIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  laneIndicator: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  leftLaneIndicator: {
    marginRight: 10,
  },
  rightLaneIndicator: {
    marginLeft: 10,
  },
  laneText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
  },
  borderGateArea: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 180,
    alignItems: 'center',
  },
  usInspectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  inspectionGates: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '85%',
    marginBottom: 20,
  },
  gateColumn: {
    alignItems: 'center',
  },
  gateLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 6,
  },
  gate: {
    width: 40,
    height: 25,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    position: 'relative',
  },
  gateCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: -25,
  },
  gateAreaCars: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 100,
  },
  gateCarPosition: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  laneVerticalLine: {
    position: 'absolute',
    width: 2,
    height: '55%',
    top: '35%',
  },
  queuedCar: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  startingLineContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startingLineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  facilitiesContainer: {
    position: 'absolute',
    left: 60, // Moved much closer to the lanes
    top: '40%',
    bottom: '15%',
    width: 80,
    justifyContent: 'space-between',
  },
  facilityLabel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityText: {
    fontSize: 10,
    fontWeight: '400',
    transform: [{ rotate: '-45deg' }], // Diagonal rotation like in photo
    textAlign: 'center',
    width: 270,
  },
  vehicle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    position: 'absolute',
    top: -12,
    left: -8,
    right: -8,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  gateBadge: {
    position: 'absolute',
    bottom: -12,
    left: -6,
    right: -6,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateBadgeText: {
    fontSize: 8,
    fontWeight: '700',
  },
  locationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  navigationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LaneSimulationScreen;