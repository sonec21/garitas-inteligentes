import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MapScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.disabledContainer}>
        <Text style={[styles.disabledTitle, { color: theme.colors.text }]}>
          Map Screen
        </Text>
        <Text style={[styles.disabledMessage, { color: theme.colors.textSecondary }]}>
          Map functionality is temporarily disabled.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  disabledMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MapScreen;
