import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ModernIcon from './ModernIcon';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconFamily?: 'ionicons' | 'material' | 'feather';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconFamily = 'ionicons',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 24;
        break;
      case 'medium':
      default:
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 20;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.surface;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = theme.colors.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'primary':
      default:
        baseStyle.backgroundColor = theme.colors.primary;
        break;
    }

    // Disabled styles
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size text styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 12;
        break;
      case 'large':
        baseTextStyle.fontSize = 18;
        break;
      case 'medium':
      default:
        baseTextStyle.fontSize = 14;
        break;
    }

    // Variant text styles
    switch (variant) {
      case 'secondary':
        baseTextStyle.color = theme.colors.text;
        break;
      case 'outline':
        baseTextStyle.color = theme.colors.primary;
        break;
      case 'ghost':
        baseTextStyle.color = theme.colors.primary;
        break;
      case 'primary':
      default:
        baseTextStyle.color = '#FFFFFF';
        break;
    }

    return baseTextStyle;
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'secondary':
        return theme.colors.text;
      case 'outline':
      case 'ghost':
        return theme.colors.primary;
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 20;
      case 'medium':
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <>
          {icon && (
            <ModernIcon
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              family={iconFamily}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default ModernButton;