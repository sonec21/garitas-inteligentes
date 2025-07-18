import React from 'react';
import { View, Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000', 
  strokeWidth = 2 
}) => {
  const iconSize = size;
  
  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* House roof */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: [{ translateX: -iconSize * 0.3 }],
                width: 0,
                height: 0,
                borderLeftWidth: iconSize * 0.3,
                borderRightWidth: iconSize * 0.3,
                borderBottomWidth: iconSize * 0.25,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
              }} />
              {/* House base */}
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: '15%',
                width: '70%',
                height: '50%',
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
            </View>
          </View>
        );
        
      case 'location':
      case 'map-pin':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.7, height: iconSize * 0.9 }}>
              {/* Location pin shape */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '70%',
                borderRadius: iconSize * 0.35,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Center dot */}
              <View style={{
                position: 'absolute',
                top: '20%',
                left: '30%',
                width: '40%',
                height: '30%',
                borderRadius: iconSize * 0.15,
                backgroundColor: color,
              }} />
              {/* Bottom point */}
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: [{ translateX: -iconSize * 0.05 }],
                width: 0,
                height: 0,
                borderLeftWidth: iconSize * 0.1,
                borderRightWidth: iconSize * 0.1,
                borderTopWidth: iconSize * 0.2,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'close':
      case 'x':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* First line of X */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: '80%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ rotate: '45deg' }],
              }} />
              {/* Second line of X */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                width: '80%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ rotate: '-45deg' }],
              }} />
            </View>
          </View>
        );
        
      case 'clock':
      case 'time':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.85, height: iconSize * 0.85 }}>
              {/* Clock circle */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: iconSize * 0.425,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Center dot */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: iconSize * 0.08,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
                transform: [{ translateX: -iconSize * 0.04 }, { translateY: -iconSize * 0.04 }],
              }} />
              {/* Hour hand (shorter, thicker) */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '25%',
                height: strokeWidth + 1,
                backgroundColor: color,
                borderRadius: strokeWidth / 2,
                transform: [{ translateX: -iconSize * 0.106 }, { translateY: -(strokeWidth + 1) / 2 }, { rotate: '30deg' }],
              }} />
              {/* Minute hand (longer, thinner) */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '35%',
                height: strokeWidth,
                backgroundColor: color,
                borderRadius: strokeWidth / 2,
                transform: [{ translateX: -iconSize * 0.149 }, { translateY: -strokeWidth / 2 }, { rotate: '90deg' }],
              }} />
              {/* 12 o'clock mark */}
              <View style={{
                position: 'absolute',
                top: '8%',
                left: '50%',
                width: strokeWidth,
                height: '12%',
                backgroundColor: color,
                transform: [{ translateX: -strokeWidth / 2 }],
              }} />
              {/* 3 o'clock mark */}
              <View style={{
                position: 'absolute',
                top: '50%',
                right: '8%',
                width: '12%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ translateY: -strokeWidth / 2 }],
              }} />
              {/* 6 o'clock mark */}
              <View style={{
                position: 'absolute',
                bottom: '8%',
                left: '50%',
                width: strokeWidth,
                height: '12%',
                backgroundColor: color,
                transform: [{ translateX: -strokeWidth / 2 }],
              }} />
              {/* 9 o'clock mark */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '8%',
                width: '12%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ translateY: -strokeWidth / 2 }],
              }} />
            </View>
          </View>
        );

      case 'clock-simple':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* Simple clock circle */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: iconSize * 0.4,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Simple hour hand */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '30%',
                height: strokeWidth + 1,
                backgroundColor: color,
                borderRadius: strokeWidth / 2,
                transform: [{ translateX: -iconSize * 0.12 }, { translateY: -(strokeWidth + 1) / 2 }, { rotate: '45deg' }],
              }} />
              {/* Simple minute hand */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '40%',
                height: strokeWidth,
                backgroundColor: color,
                borderRadius: strokeWidth / 2,
                transform: [{ translateX: -iconSize * 0.16 }, { translateY: -strokeWidth / 2 }, { rotate: '90deg' }],
              }} />
              {/* Center dot */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: color,
                transform: [{ translateX: -iconSize * 0.03 }, { translateY: -iconSize * 0.03 }],
              }} />
            </View>
          </View>
        );

      case 'timer':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.85 }}>
              {/* Timer winding key */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: iconSize * 0.1,
                height: iconSize * 0.15,
                backgroundColor: color,
                borderRadius: iconSize * 0.05,
                transform: [{ translateX: -iconSize * 0.05 }],
              }} />
              {/* Timer body */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: 0,
                width: '100%',
                height: '85%',
                borderRadius: iconSize * 0.4,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Timer dial/numbers */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                width: strokeWidth,
                height: '15%',
                backgroundColor: color,
                transform: [{ translateX: -strokeWidth / 2 }],
              }} />
              <View style={{
                position: 'absolute',
                top: '50%',
                right: '10%',
                width: '15%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ translateY: -strokeWidth / 2 }],
              }} />
              {/* Timer hand */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '25%',
                height: strokeWidth + 1,
                backgroundColor: color,
                borderRadius: strokeWidth / 2,
                transform: [{ translateX: -iconSize * 0.1 }, { translateY: -(strokeWidth + 1) / 2 }, { rotate: '135deg' }],
              }} />
            </View>
          </View>
        );

      case 'hourglass':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.6, height: iconSize * 0.85 }}>
              {/* Top frame */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '8%',
                backgroundColor: color,
                borderRadius: iconSize * 0.02,
              }} />
              {/* Bottom frame */}
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '8%',
                backgroundColor: color,
                borderRadius: iconSize * 0.02,
              }} />
              {/* Top glass */}
              <View style={{
                position: 'absolute',
                top: '8%',
                left: '10%',
                width: '80%',
                height: '35%',
                borderTopLeftRadius: iconSize * 0.05,
                borderTopRightRadius: iconSize * 0.05,
                borderBottomLeftRadius: iconSize * 0.15,
                borderBottomRightRadius: iconSize * 0.15,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Bottom glass */}
              <View style={{
                position: 'absolute',
                bottom: '8%',
                left: '10%',
                width: '80%',
                height: '35%',
                borderBottomLeftRadius: iconSize * 0.05,
                borderBottomRightRadius: iconSize * 0.05,
                borderTopLeftRadius: iconSize * 0.15,
                borderTopRightRadius: iconSize * 0.15,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Sand in bottom */}
              <View style={{
                position: 'absolute',
                bottom: '15%',
                left: '25%',
                width: '50%',
                height: '15%',
                borderBottomLeftRadius: iconSize * 0.03,
                borderBottomRightRadius: iconSize * 0.03,
                backgroundColor: color,
              }} />
              {/* Sand falling */}
              <View style={{
                position: 'absolute',
                top: '45%',
                left: '48%',
                width: '4%',
                height: '10%',
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'stopwatch':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.85, height: iconSize * 0.85 }}>
              {/* Filled circle background */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: iconSize * 0.425,
                backgroundColor: color,
              }} />
              
              {/* Clock hands - white/contrasting color */}
              {/* Hour hand (shorter) */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '25%',
                height: 2,
                backgroundColor: 'white',
                borderRadius: 1,
                transform: [{ translateX: -iconSize * 0.106 }, { translateY: -1 }, { rotate: '45deg' }],
              }} />
              
              {/* Minute hand (longer) */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '35%',
                height: 1.5,
                backgroundColor: 'white',
                borderRadius: 0.75,
                transform: [{ translateX: -iconSize * 0.149 }, { translateY: -0.75 }, { rotate: '90deg' }],
              }} />
              
              {/* Center dot */}
              <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: iconSize * 0.08,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.04,
                backgroundColor: 'white',
                transform: [{ translateX: -iconSize * 0.04 }, { translateY: -iconSize * 0.04 }],
              }} />
            </View>
          </View>
        );
        
      case 'car':
      case 'vehicle':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.85, height: iconSize * 0.7 }}>
              {/* Car main body */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '5%',
                width: '90%',
                height: '45%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Windshield */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: '60%',
                height: '25%',
                borderTopLeftRadius: iconSize * 0.06,
                borderTopRightRadius: iconSize * 0.06,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
                borderBottomWidth: 0,
              }} />
              {/* Left wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                left: '15%',
                width: iconSize * 0.18,
                height: iconSize * 0.18,
                borderRadius: iconSize * 0.09,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Right wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                right: '15%',
                width: iconSize * 0.18,
                height: iconSize * 0.18,
                borderRadius: iconSize * 0.09,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Front bumper */}
              <View style={{
                position: 'absolute',
                top: '40%',
                right: '2%',
                width: '8%',
                height: '20%',
                borderRadius: iconSize * 0.02,
                backgroundColor: color,
              }} />
              {/* Rear bumper */}
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '2%',
                width: '8%',
                height: '20%',
                borderRadius: iconSize * 0.02,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'car-simple':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.85, height: iconSize * 0.65 }}>
              {/* Sports car body - lower and sleeker */}
              <View style={{
                position: 'absolute',
                top: '35%',
                left: '8%',
                width: '84%',
                height: '40%',
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
              
              {/* Front hood/nose - pointed */}
              <View style={{
                position: 'absolute',
                top: '35%',
                right: '3%',
                width: '12%',
                height: '40%',
                borderTopRightRadius: iconSize * 0.06,
                borderBottomRightRadius: iconSize * 0.06,
                backgroundColor: color,
              }} />
              
              {/* Rear section */}
              <View style={{
                position: 'absolute',
                top: '35%',
                left: '3%',
                width: '10%',
                height: '40%',
                borderTopLeftRadius: iconSize * 0.05,
                borderBottomLeftRadius: iconSize * 0.05,
                backgroundColor: color,
              }} />
              
              {/* Windshield - angled like a sports car */}
              <View style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '45%',
                height: '25%',
                borderTopLeftRadius: iconSize * 0.04,
                borderTopRightRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
              
              {/* Side windows */}
              <View style={{
                position: 'absolute',
                top: '42%',
                left: '30%',
                width: '35%',
                height: '8%',
                borderRadius: iconSize * 0.02,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
              
              {/* Left wheel */}
              <View style={{
                position: 'absolute',
                bottom: '10%',
                left: '18%',
                width: iconSize * 0.16,
                height: iconSize * 0.16,
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
              
              {/* Right wheel */}
              <View style={{
                position: 'absolute',
                bottom: '10%',
                right: '18%',
                width: iconSize * 0.16,
                height: iconSize * 0.16,
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
              
              {/* Front headlight */}
              <View style={{
                position: 'absolute',
                top: '48%',
                right: '8%',
                width: iconSize * 0.04,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.02,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
            </View>
          </View>
        );

      case 'car-front':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.7, height: iconSize * 0.8 }}>
              {/* Car front body */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: '10%',
                width: '80%',
                height: '70%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Windshield */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '20%',
                width: '60%',
                height: '35%',
                borderRadius: iconSize * 0.05,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Left headlight */}
              <View style={{
                position: 'absolute',
                top: '70%',
                left: '20%',
                width: iconSize * 0.08,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              {/* Right headlight */}
              <View style={{
                position: 'absolute',
                top: '70%',
                right: '20%',
                width: iconSize * 0.08,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              {/* Grille */}
              <View style={{
                position: 'absolute',
                bottom: '10%',
                left: '35%',
                width: '30%',
                height: '8%',
                borderRadius: iconSize * 0.02,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'cars-multiple':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.9, height: iconSize * 0.8 }}>
              {/* Back car */}
              <View style={{
                position: 'absolute',
                top: '0%',
                left: '30%',
                width: '60%',
                height: '35%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Back car wheels */}
              <View style={{
                position: 'absolute',
                top: '30%',
                left: '35%',
                width: iconSize * 0.08,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '30%',
                right: '15%',
                width: iconSize * 0.08,
                height: iconSize * 0.08,
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              
              {/* Front car */}
              <View style={{
                position: 'absolute',
                bottom: '20%',
                left: '10%',
                width: '70%',
                height: '40%',
                borderRadius: iconSize * 0.1,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Front car wheels */}
              <View style={{
                position: 'absolute',
                bottom: '15%',
                left: '20%',
                width: iconSize * 0.1,
                height: iconSize * 0.1,
                borderRadius: iconSize * 0.05,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                bottom: '15%',
                right: '25%',
                width: iconSize * 0.1,
                height: iconSize * 0.1,
                borderRadius: iconSize * 0.05,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'truck':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.9, height: iconSize * 0.7 }}>
              {/* Truck cab */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: '5%',
                width: '35%',
                height: '65%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Truck trailer */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '35%',
                width: '60%',
                height: '55%',
                borderRadius: iconSize * 0.05,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Cab wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                left: '15%',
                width: iconSize * 0.15,
                height: iconSize * 0.15,
                borderRadius: iconSize * 0.075,
                backgroundColor: color,
              }} />
              {/* Trailer wheels */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                left: '60%',
                width: iconSize * 0.15,
                height: iconSize * 0.15,
                borderRadius: iconSize * 0.075,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                bottom: '5%',
                right: '10%',
                width: iconSize * 0.15,
                height: iconSize * 0.15,
                borderRadius: iconSize * 0.075,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'suv':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.85, height: iconSize * 0.75 }}>
              {/* SUV main body - taller */}
              <View style={{
                position: 'absolute',
                top: '20%',
                left: '5%',
                width: '90%',
                height: '55%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* SUV windshield - larger */}
              <View style={{
                position: 'absolute',
                top: '8%',
                left: '15%',
                width: '70%',
                height: '30%',
                borderTopLeftRadius: iconSize * 0.06,
                borderTopRightRadius: iconSize * 0.06,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
                borderBottomWidth: 0,
              }} />
              {/* Roof rack */}
              <View style={{
                position: 'absolute',
                top: '5%',
                left: '20%',
                width: '60%',
                height: strokeWidth,
                backgroundColor: color,
              }} />
              {/* Left wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                left: '12%',
                width: iconSize * 0.2,
                height: iconSize * 0.2,
                borderRadius: iconSize * 0.1,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Right wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                right: '12%',
                width: iconSize * 0.2,
                height: iconSize * 0.2,
                borderRadius: iconSize * 0.1,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
            </View>
          </View>
        );

      case 'bus':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.9, height: iconSize * 0.8 }}>
              {/* Bus body */}
              <View style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '90%',
                height: '65%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Bus windows */}
              <View style={{
                position: 'absolute',
                top: '20%',
                left: '15%',
                width: '15%',
                height: '20%',
                borderRadius: iconSize * 0.03,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '20%',
                left: '40%',
                width: '15%',
                height: '20%',
                borderRadius: iconSize * 0.03,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '20%',
                right: '15%',
                width: '15%',
                height: '20%',
                borderRadius: iconSize * 0.03,
                backgroundColor: color,
              }} />
              {/* Bus door */}
              <View style={{
                position: 'absolute',
                top: '45%',
                left: '15%',
                width: '10%',
                height: '20%',
                borderRadius: iconSize * 0.02,
                backgroundColor: color,
              }} />
              {/* Left wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                left: '18%',
                width: iconSize * 0.16,
                height: iconSize * 0.16,
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
              {/* Right wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                right: '18%',
                width: iconSize * 0.16,
                height: iconSize * 0.16,
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'van':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.85, height: iconSize * 0.75 }}>
              {/* Van body - boxy shape */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: '5%',
                width: '90%',
                height: '60%',
                borderRadius: iconSize * 0.05,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Van windshield */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '15%',
                width: '25%',
                height: '25%',
                borderRadius: iconSize * 0.03,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Van side window */}
              <View style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                width: '20%',
                height: '15%',
                borderRadius: iconSize * 0.02,
                backgroundColor: color,
              }} />
              {/* Left wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                left: '15%',
                width: iconSize * 0.18,
                height: iconSize * 0.18,
                borderRadius: iconSize * 0.09,
                backgroundColor: color,
              }} />
              {/* Right wheel */}
              <View style={{
                position: 'absolute',
                bottom: '5%',
                right: '15%',
                width: iconSize * 0.18,
                height: iconSize * 0.18,
                borderRadius: iconSize * 0.09,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );

      case 'traffic-jam':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.95, height: iconSize * 0.8 }}>
              {/* Three cars in a row */}
              {/* Car 1 */}
              <View style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '25%',
                height: '25%',
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '30%',
                left: '8%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '30%',
                left: '22%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
              
              {/* Car 2 */}
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '35%',
                width: '25%',
                height: '25%',
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '60%',
                left: '38%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '60%',
                left: '52%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
              
              {/* Car 3 */}
              <View style={{
                position: 'absolute',
                top: '25%',
                right: '5%',
                width: '25%',
                height: '25%',
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '45%',
                right: '22%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '45%',
                right: '8%',
                width: iconSize * 0.06,
                height: iconSize * 0.06,
                borderRadius: iconSize * 0.03,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'star':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* Star shape using multiple triangles */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: 0,
                height: 0,
                borderLeftWidth: iconSize * 0.1,
                borderRightWidth: iconSize * 0.1,
                borderBottomWidth: iconSize * 0.3,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
                transform: [{ translateX: -iconSize * 0.1 }],
              }} />
              {/* Star outline circle for simplicity */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: '15%',
                width: '70%',
                height: '70%',
                borderRadius: iconSize * 0.28,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Center dot */}
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '40%',
                width: '20%',
                height: '20%',
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'bell':
      case 'notification':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* Bell shape */}
              <View style={{
                position: 'absolute',
                top: '10%',
                left: '20%',
                width: '60%',
                height: '60%',
                borderTopLeftRadius: iconSize * 0.24,
                borderTopRightRadius: iconSize * 0.24,
                borderBottomLeftRadius: iconSize * 0.05,
                borderBottomRightRadius: iconSize * 0.05,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Bell top */}
              <View style={{
                position: 'absolute',
                top: '5%',
                left: '45%',
                width: '10%',
                height: '15%',
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Bell bottom */}
              <View style={{
                position: 'absolute',
                bottom: '20%',
                left: '15%',
                width: '70%',
                height: strokeWidth,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'chevron-right':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.5, height: iconSize * 0.7 }}>
              {/* Top line of chevron */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: 0,
                width: '70%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ rotate: '35deg' }],
              }} />
              {/* Bottom line of chevron */}
              <View style={{
                position: 'absolute',
                bottom: '25%',
                left: 0,
                width: '70%',
                height: strokeWidth,
                backgroundColor: color,
                transform: [{ rotate: '-35deg' }],
              }} />
            </View>
          </View>
        );
        
      case 'settings':
      case 'gear':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* Gear circle */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '25%',
                width: '50%',
                height: '50%',
                borderRadius: iconSize * 0.2,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Center hole */}
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '40%',
                width: '20%',
                height: '20%',
                borderRadius: iconSize * 0.08,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'lock':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.7, height: iconSize * 0.8 }}>
              {/* Lock body */}
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '60%',
                borderRadius: iconSize * 0.08,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Lock shackle */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                width: '60%',
                height: '50%',
                borderTopLeftRadius: iconSize * 0.15,
                borderTopRightRadius: iconSize * 0.15,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
                borderBottomWidth: 0,
              }} />
            </View>
          </View>
        );
        
      case 'document':
      case 'file':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.6, height: iconSize * 0.8 }}>
              {/* Document body */}
              <View style={{
                position: 'absolute',
                top: '15%',
                left: 0,
                width: '100%',
                height: '85%',
                borderRadius: iconSize * 0.05,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Document corner fold */}
              <View style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 0,
                height: 0,
                borderLeftWidth: iconSize * 0.15,
                borderBottomWidth: iconSize * 0.15,
                borderLeftColor: 'transparent',
                borderBottomColor: color,
              }} />
              {/* Document lines */}
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '15%',
                width: '70%',
                height: strokeWidth,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '55%',
                left: '15%',
                width: '70%',
                height: strokeWidth,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'help':
      case 'question':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* Question mark circle */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: iconSize * 0.4,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Question mark */}
              <View style={{
                position: 'absolute',
                top: '25%',
                left: '35%',
                width: '30%',
                height: '25%',
                borderTopLeftRadius: iconSize * 0.1,
                borderTopRightRadius: iconSize * 0.1,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
                borderBottomWidth: 0,
              }} />
              {/* Question mark dot */}
              <View style={{
                position: 'absolute',
                bottom: '25%',
                left: '45%',
                width: '10%',
                height: '10%',
                borderRadius: iconSize * 0.04,
                backgroundColor: color,
              }} />
            </View>
          </View>
        );
        
      case 'logout':
      case 'sign-out':
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
              {/* Door frame */}
              <View style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                width: '60%',
                height: '100%',
                borderRadius: iconSize * 0.05,
                borderWidth: strokeWidth,
                borderColor: color,
                backgroundColor: 'transparent',
              }} />
              {/* Door handle */}
              <View style={{
                position: 'absolute',
                top: '45%',
                left: '60%',
                width: '8%',
                height: '8%',
                borderRadius: iconSize * 0.02,
                backgroundColor: color,
              }} />
              {/* Exit arrow */}
              <View style={{
                position: 'absolute',
                top: '45%',
                left: '5%',
                width: '25%',
                height: strokeWidth,
                backgroundColor: color,
              }} />
              <View style={{
                position: 'absolute',
                top: '40%',
                left: '5%',
                width: 0,
                height: 0,
                borderTopWidth: iconSize * 0.08,
                borderBottomWidth: iconSize * 0.08,
                borderRightWidth: iconSize * 0.1,
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderRightColor: color,
              }} />
            </View>
          </View>
        );
        
      default:
        return (
          <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: iconSize * 0.8, color }}>?</Text>
          </View>
        );
    }
  };

  return renderIcon();
};

export default Icon;