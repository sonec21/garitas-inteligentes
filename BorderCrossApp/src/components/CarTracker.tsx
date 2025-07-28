import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PlacesService, { WaitingLine } from '../services/PlacesService';

export interface CarPosition {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  waitingLineId: string;
  estimatedWaitTime?: number;
}

interface CarTrackerProps {
  waitingLines: WaitingLine[];
  onCarPositionUpdate: (position: CarPosition) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const CarTracker: React.FC<CarTrackerProps> = ({
  waitingLines,
  onCarPositionUpdate,
  userLocation,
}) => {
  const { theme } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [selectedLine, setSelectedLine] = useState<WaitingLine | null>(null);
  const [currentPosition, setCurrentPosition] = useState<CarPosition | null>(null);

  useEffect(() => {
    if (isTracking && userLocation && selectedLine) {
      // Update car position
      const newPosition: CarPosition = {
        id: `car_${Date.now()}`,
        coordinate: userLocation,
        timestamp: new Date(),
        waitingLineId: selectedLine.id,
        estimatedWaitTime: PlacesService.calculateEstimatedWaitTime(
          selectedLine,
          userLocation
        ),
      };

      setCurrentPosition(newPosition);
      onCarPositionUpdate(newPosition);

      // Update the waiting line data in the service
      PlacesService.updateWaitingLineData(selectedLine.id, userLocation);
    }
  }, [userLocation, isTracking, selectedLine, onCarPositionUpdate]);

  const startTracking = (line: WaitingLine) => {
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services to track your position in line.'
      );
      return;
    }

    setSelectedLine(line);
    setIsTracking(true);
    
    Alert.alert(
      'Tracking Started',
      `Now tracking your position in ${line.name}. We'll monitor your wait time and position.`,
      [{ text: 'OK' }]
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    setSelectedLine(null);
    setCurrentPosition(null);
    
    Alert.alert(
      'Tracking Stopped',
      'Car tracking has been stopped.',
      [{ text: 'OK' }]
    );
  };

  const getLineTypeIcon = (type: string) => {
    return type === 'vehicle' ? '🚗' : '🚶';
  };

  const getLineTypeColor = (type: string) => {
    return type === 'vehicle' ? '#2196F3' : '#9C27B0';
  };

  if (waitingLines.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🚗 Car Tracking
      </Text>
      
      {!isTracking ? (
        <View>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Select a waiting line to track your position:
          </Text>
          
          {waitingLines.map((line) => (
            <TouchableOpacity
              key={line.id}
              style={[
                styles.lineButton,
                { 
                  backgroundColor: getLineTypeColor(line.type),
                  opacity: line.type === 'vehicle' ? 1 : 0.5,
                }
              ]}
              onPress={() => startTracking(line)}
              disabled={line.type !== 'vehicle'}
            >
              <Text style={styles.lineButtonText}>
                {getLineTypeIcon(line.type)} {line.name}
              </Text>
              {line.type !== 'vehicle' && (
                <Text style={styles.disabledText}>
                  (Vehicle tracking only)
                </Text>
              )}
            </TouchableOpacity>
          ))}
          
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            💡 Vehicle tracking helps estimate wait times and shows your position to other users
          </Text>
        </View>
      ) : (
        <View>
          <View style={styles.trackingInfo}>
            <Text style={[styles.trackingTitle, { color: theme.colors.text }]}>
              Currently tracking: {selectedLine?.name}
            </Text>
            
            {currentPosition && (
              <View style={styles.positionInfo}>
                <Text style={[styles.positionText, { color: theme.colors.textSecondary }]}>
                  📍 Position: {currentPosition.coordinate.latitude.toFixed(6)}, {currentPosition.coordinate.longitude.toFixed(6)}
                </Text>
                
                {currentPosition.estimatedWaitTime && (
                  <Text style={[styles.waitTimeText, { color: theme.colors.primary }]}>
                    ⏱️ Estimated wait: ~{currentPosition.estimatedWaitTime} minutes
                  </Text>
                )}
                
                <Text style={[styles.timestampText, { color: theme.colors.textSecondary }]}>
                  Last update: {currentPosition.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.stopButton, { backgroundColor: '#F44336' }]}
            onPress={stopTracking}
          >
            <Text style={styles.stopButtonText}>
              🛑 Stop Tracking
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.trackingHelpText, { color: theme.colors.textSecondary }]}>
            💡 Your position is being shared anonymously to help other drivers estimate wait times
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  lineButton: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  lineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  helpText: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  trackingInfo: {
    marginBottom: 16,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  positionInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  positionText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  waitTimeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  stopButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trackingHelpText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default CarTracker;