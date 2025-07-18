import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput as RNTextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../config/supabase';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for verification link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigation.replace('Main');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.accent }]}>Garita Inteligente</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Tu compañero inteligente para cruces fronterizos
            </Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            <RNTextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              placeholderTextColor={theme.colors.textTertiary}
            />

            <RNTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                },
              ]}
              placeholderTextColor={theme.colors.textTertiary}
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.accent }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.card} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.colors.card }]}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.textButton]}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={[styles.textButtonText, { color: theme.colors.accent }]}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity
            style={[
              styles.button,
              styles.outlinedButton,
              { borderColor: theme.colors.accent },
            ]}
            onPress={handleGuestAccess}
          >
            <Text style={[styles.outlinedButtonText, { color: theme.colors.accent }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          <Text style={[styles.guestNote, { color: theme.colors.textTertiary }]}>
            Limited features available in guest mode
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '400',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 56,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlinedButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  guestNote: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 12,
  },
});

export default LoginScreen;