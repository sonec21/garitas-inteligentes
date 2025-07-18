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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
    const totalCars = Math.min(lane.vehicle_count, 20);
    const carsData: SimulatedCar[] = [];
    
    const carTypes = ['car', 'truck', 'motorcycle'] as const;
    const carColors = ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1'];
    
    // Split cars between two lanes
    const leftLaneCars = Math.ceil(totalCars / 2);
    const rightLaneCars = totalCars - leftLaneCars;
    
    // Generate cars for left lane
    let currentPosition = 95;
    for (let i = 0; i < leftLaneCars; i++) {
      const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
      const vehicleSpacing = getVehicleSpacing(carType);
      
      carsData.push({
        id: `left-car-${i}`,
        type: carType,
        color: carColors[Math.floor(Math.random() * carColors.length)],
        position: currentPosition,
        lane: 'left',
        gateNumber: Math.floor(Math.random() * 2) + 1, // Gates 1-2 for left lane
        isUserCar: i === Math.floor(leftLaneCars / 3),
      });
      
      currentPosition -= (vehicleSpacing + 8);
      if (currentPosition < 5) break;
    }
    
    // Generate cars for right lane
    currentPosition = 95;
    for (let i = 0; i < rightLaneCars; i++) {
      const carType = carTypes[Math.floor(Math.random() * carTypes.length)];
      const vehicleSpacing = getVehicleSpacing(carType);
      
      carsData.push({
        id: `right-car-${i}`,
        type: carType,
        color: carColors[Math.floor(Math.random() * carColors.length)],
        position: currentPosition,
        lane: 'right',
        gateNumber: Math.floor(Math.random() * 2) + 3, // Gates 3-4 for right lane
        isUserCar: !carsData.some(car => car.isUserCar) && i === Math.floor(rightLaneCars / 3),
      });
      
      currentPosition -= (vehicleSpacing + 8);
      if (currentPosition < 5) break;
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
        return 'local-shipping';
      case 'motorcycle':
        return 'motorcycle';
      default:
        return 'directions-car';
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
      {/* Main border line */}
      <View style={[styles.borderLine, { backgroundColor: theme.colors.error }]} />
      
      {/* Individual inspection gates */}
      <View style={styles.inspectionGates}>
        {[1, 2, 3, 4].map((gateNum) => (
          <View key={gateNum} style={[styles.gate, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="security" size={16} color={theme.colors.accent} />
            <Text style={[styles.gateNumber, { color: theme.colors.text }]}>
              {gateNum}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Border label */}
      <Text style={[styles.borderLabel, { color: theme.colors.text }]}>
        🇺🇸 Border Inspection Gates 🇲🇽
      </Text>
    </View>
  );

  const renderLaneLines = () => {
    const startX = (SIMULATION_WIDTH - TOTAL_LANES_WIDTH) / 2;
    
    return (
      <View style={styles.laneContainer}>
        {/* Left lane boundaries */}
        <View style={[
          styles.laneLine, 
          { left: startX, backgroundColor: theme.colors.textTertiary + '60' }
        ]} />
        <View style={[
          styles.laneLine, 
          { left: startX + LANE_WIDTH, backgroundColor: theme.colors.textTertiary + '80' }
        ]} />
        
        {/* Right lane boundaries */}
        <View style={[
          styles.laneLine, 
          { left: startX + (LANE_WIDTH * 2), backgroundColor: theme.colors.textTertiary + '60' }
        ]} />
        
        {/* Center divider between lanes (dashed) */}
        <View style={[styles.centerDivider, { left: startX + LANE_WIDTH }]}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.centerDash,
                { backgroundColor: theme.colors.textTertiary + '80' },
              ]}
            />
          ))}
        </View>
        
        {/* Gate approach lines (where lanes start splitting) */}
        <View style={[styles.splitZone, { top: '10%', height: '25%' }]}>
          {[1, 2, 3, 4].map((gateNum) => (
            <View
              key={gateNum}
              style={[
                styles.gateLine,
                {
                  left: getGatePosition(gateNum) - 1,
                  backgroundColor: theme.colors.warning + '40',
                },
              ]}
            />
          ))}
        </View>
        
        {/* Lane labels */}
        <View style={[styles.laneLabels, { left: startX }]}>
          <View style={[styles.laneLabel, { width: LANE_WIDTH }]}>
            <Text style={[styles.laneText, { color: theme.colors.textSecondary }]}>LEFT</Text>
          </View>
          <View style={[styles.laneLabel, { width: LANE_WIDTH }]}>
            <Text style={[styles.laneText, { color: theme.colors.textSecondary }]}>RIGHT</Text>
          </View>
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

  const renderCar = (car: SimulatedCar, index: number) => {
    const animatedStyle = car.isUserCar ? {
      transform: [{
        translateY: animationRef.current.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      }],
    } : {};

    const iconSize = car.type === 'motorcycle' ? 24 : car.type === 'truck' ? 32 : 28;
    const lanePosition = getLanePosition(car.lane);
    
    // Calculate splitting behavior near the border
    let finalLeft = lanePosition;
    
    if (car.position > 80 && car.gateNumber) {
      // Phase 1: Prepare to split (80-90%)
      if (car.position <= 90) {
        const prepareProgress = (car.position - 80) / 10; // 0 to 1
        // Slight movement toward gate direction
        const gatePosition = getGatePosition(car.gateNumber);
        const preparationOffset = (gatePosition - lanePosition) * 0.2 * prepareProgress;
        finalLeft = lanePosition + preparationOffset;
      }
      // Phase 2: Active splitting (90-95%)
      else if (car.position <= 95) {
        const splitProgress = (car.position - 90) / 5; // 0 to 1
        const gatePosition = getGatePosition(car.gateNumber);
        finalLeft = lanePosition + (gatePosition - lanePosition) * splitProgress;
      }
      // Phase 3: Aligned with gate (95%+)
      else {
        finalLeft = getGatePosition(car.gateNumber);
      }
    }

    return (
      <Animated.View
        key={car.id}
        style={[
          styles.vehicle,
          {
            bottom: (car.position / 100) * 350 + 90, // More space for the simulation
            left: finalLeft - (iconSize / 2), // Center the icon based on its size
          },
          animatedStyle,
        ]}
      >
        <MaterialIcons 
          name={getCarIcon(car.type)} 
          size={iconSize} 
          color={car.color}
        />
        {car.isUserCar && (
          <View style={[styles.userBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.userBadgeText, { color: 'white' }]}>YOU</Text>
          </View>
        )}
        {car.position > 80 && (
          <View style={[styles.gateBadge, { backgroundColor: theme.colors.warning }]}>
            <Text style={[styles.gateBadgeText, { color: 'white' }]}>
              G{car.gateNumber}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
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
            <MaterialIcons name="queue" size={24} color={theme.colors.accent} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {getPositionText()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Cars Ahead
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <MaterialIcons name="schedule" size={24} color={theme.colors.warning} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {getEstimatedWaitTime()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Minutes Left
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <MaterialIcons name="directions-car" size={24} color={theme.colors.success} />
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
          <Text style={[styles.simulationTitle, { color: theme.colors.text }]}>
            Live Lane View
          </Text>
          
          <View style={styles.simulationContainer}>
            {renderLaneLines()}
            {renderBorderGate()}
            {cars.map(renderCar)}
          </View>
        </View>

        {/* Last Car Location */}
        <View style={[styles.locationCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.locationHeader}>
            <MaterialIcons name="place" size={24} color={theme.colors.error} />
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
            <MaterialIcons name="navigation" size={20} color="white" />
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
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
    padding: 20,
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
    height: 450,
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
    height: 80,
  },
  borderLine: {
    height: 4,
    width: '100%',
    marginBottom: 8,
  },
  inspectionGates: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 8,
  },
  gate: {
    width: 60,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  gateNumber: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  borderLabel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
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