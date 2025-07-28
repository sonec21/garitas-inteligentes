import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🚨 App Error</Text>
            <Text style={styles.subtitle}>Something went wrong. Here are the details:</Text>
            
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Error:</Text>
              <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
            </View>
            
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Stack Trace:</Text>
              <Text style={styles.errorText}>{this.state.error?.stack}</Text>
            </View>
            
            {this.state.errorInfo && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Component Stack:</Text>
                <Text style={styles.errorText}>{this.state.errorInfo.componentStack}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});

export default ErrorBoundary;