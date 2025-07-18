import Config from 'react-native-config';

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn(
    'Google Maps API key not found. Maps functionality will be limited.',
  );
}

// You'll need to:
// 1. Go to Google Cloud Console
// 2. Enable Maps SDK for Android and iOS
// 3. Create an API key
// 4. Add GOOGLE_MAPS_API_KEY to your .env file
