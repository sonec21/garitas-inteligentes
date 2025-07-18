import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { debugEnvironment } from './src/utils/debugEnv';

// Debug environment variables on app start
debugEnvironment();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.colors.statusBar} 
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      <AppNavigator />
    </GestureHandlerRootView>
  );
};

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;