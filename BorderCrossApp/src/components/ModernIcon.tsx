import React from 'react';
import { ViewStyle } from 'react-native';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

export type IconFamily = 'ionicons' | 'material' | 'feather';

interface ModernIconProps {
  name: string;
  size?: number;
  color?: string;
  family?: IconFamily;
  style?: ViewStyle;
}

const ModernIcon: React.FC<ModernIconProps> = ({
  name,
  size = 24,
  color = '#FFFFFF',
  family = 'ionicons',
  style,
}) => {
  const iconProps = {
    name,
    size,
    color,
    style,
  };

  switch (family) {
    case 'material':
      return <MaterialIcon {...iconProps} />;
    case 'feather':
      return <FeatherIcon {...iconProps} />;
    case 'ionicons':
    default:
      return <IoniconsIcon {...iconProps} />;
  }
};

// Icon mapping for consistent usage throughout the app
export const icons = {
  // Navigation
  home: { name: 'home-outline', family: 'ionicons' as IconFamily },
  map: { name: 'map-outline', family: 'ionicons' as IconFamily },
  settings: { name: 'settings-outline', family: 'ionicons' as IconFamily },
  
  // Location & Travel
  location: { name: 'location-outline', family: 'ionicons' as IconFamily },
  navigate: { name: 'navigate-outline', family: 'ionicons' as IconFamily },
  compass: { name: 'compass-outline', family: 'ionicons' as IconFamily },
  
  // Time & Status
  time: { name: 'time-outline', family: 'ionicons' as IconFamily },
  timer: { name: 'timer-outline', family: 'ionicons' as IconFamily },
  clock: { name: 'alarm-outline', family: 'ionicons' as IconFamily },
  
  // Transportation
  car: { name: 'car-outline', family: 'ionicons' as IconFamily },
  carSport: { name: 'car-sport-outline', family: 'ionicons' as IconFamily },
  bus: { name: 'bus-outline', family: 'ionicons' as IconFamily },
  truck: { name: 'truck', family: 'feather' as IconFamily },
  
  // Actions
  refresh: { name: 'refresh-outline', family: 'ionicons' as IconFamily },
  search: { name: 'search-outline', family: 'ionicons' as IconFamily },
  filter: { name: 'filter-outline', family: 'ionicons' as IconFamily },
  close: { name: 'close-outline', family: 'ionicons' as IconFamily },
  chevronRight: { name: 'chevron-forward-outline', family: 'ionicons' as IconFamily },
  chevronDown: { name: 'chevron-down-outline', family: 'ionicons' as IconFamily },
  
  // Status indicators
  checkmark: { name: 'checkmark-circle-outline', family: 'ionicons' as IconFamily },
  warning: { name: 'warning-outline', family: 'ionicons' as IconFamily },
  alert: { name: 'alert-circle-outline', family: 'ionicons' as IconFamily },
  
  // UI Elements
  eye: { name: 'eye-outline', family: 'ionicons' as IconFamily },
  eyeOff: { name: 'eye-off-outline', family: 'ionicons' as IconFamily },
  more: { name: 'ellipsis-horizontal-outline', family: 'ionicons' as IconFamily },
  info: { name: 'information-circle-outline', family: 'ionicons' as IconFamily },
  
  // Border crossing specific
  gate: { name: 'enter-outline', family: 'ionicons' as IconFamily },
  queue: { name: 'people-outline', family: 'ionicons' as IconFamily },
  document: { name: 'document-text-outline', family: 'ionicons' as IconFamily },
  flag: { name: 'flag-outline', family: 'ionicons' as IconFamily },
};

export default ModernIcon;