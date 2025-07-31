import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import MapView from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';

const MapScreenTest: React.FC = () => {
  console.log('🗺️ MapScreenTest: Component starting...');
  
  try {
    const { theme } = useTheme();
    console.log('🗺️ MapScreenTest: Theme loaded');

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Testing MapView Import
        </Text>
        <View style={styles.map}>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            MapView component imported successfully
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Ready to render map...
          </Text>
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('🗺️ MapScreenTest: Error in component:', error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Error loading Maps</Text>
          <Text style={styles.errorDetails}>{String(error)}</Text>
        </View>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  },
  map: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});

export default MapScreenTest;