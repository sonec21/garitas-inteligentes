import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import LaneSimulationScreen from '../screens/LaneSimulationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const getTabBarIcon = (route: any, focused: boolean, color: string, size: number) => {
  const iconSize = size - 2;
  const strokeWidth = focused ? 2.5 : 2;
  
  const renderHomeIcon = () => (
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
        {/* Door */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: '40%',
          width: '20%',
          height: '35%',
          borderTopWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
          borderRightWidth: strokeWidth,
          borderColor: color,
          backgroundColor: 'transparent',
        }} />
      </View>
    </View>
  );
  
  const renderMapIcon = () => (
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
  
  const renderChatIcon = () => (
    <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.7 }}>
        {/* Chat bubble */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '75%',
          borderRadius: iconSize * 0.15,
          borderWidth: strokeWidth,
          borderColor: color,
          backgroundColor: 'transparent',
        }} />
        {/* Chat tail */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: '20%',
          width: 0,
          height: 0,
          borderTopWidth: iconSize * 0.15,
          borderTopColor: color,
          borderLeftWidth: iconSize * 0.1,
          borderLeftColor: 'transparent',
          borderRightWidth: iconSize * 0.1,
          borderRightColor: 'transparent',
        }} />
      </View>
    </View>
  );
  
  const renderProfileIcon = () => (
    <View style={{ width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'relative', width: iconSize * 0.8, height: iconSize * 0.8 }}>
        {/* Head circle */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: '25%',
          width: '50%',
          height: '45%',
          borderRadius: iconSize * 0.2,
          borderWidth: strokeWidth,
          borderColor: color,
          backgroundColor: 'transparent',
        }} />
        {/* Body/shoulders */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          width: '80%',
          height: '50%',
          borderTopLeftRadius: iconSize * 0.3,
          borderTopRightRadius: iconSize * 0.3,
          borderWidth: strokeWidth,
          borderColor: color,
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
        }} />
      </View>
    </View>
  );

  let IconComponent;
  switch (route.name) {
    case 'Home':
      IconComponent = renderHomeIcon;
      break;
    case 'Map':
      IconComponent = renderMapIcon;
      break;
    case 'Chat':
      IconComponent = renderChatIcon;
      break;
    case 'Profile':
      IconComponent = renderProfileIcon;
      break;
    default:
      IconComponent = renderHomeIcon;
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent />
      {focused && (
        <View 
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
            marginTop: 2,
          }}
        />
      )}
    </View>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="LaneSimulation" component={LaneSimulationScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size),
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 90,
          paddingTop: 10,
          paddingBottom: 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { theme, isDark } = useTheme();
  
  const navigationTheme = {
    ...isDark ? DarkTheme : DefaultTheme,
    colors: {
      ...isDark ? DarkTheme.colors : DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}