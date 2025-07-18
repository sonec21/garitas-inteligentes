import Config from 'react-native-config';

// Simple debug utility to check environment variables
export const debugEnvironment = () => {
  console.log('🔧 Environment Debug Information:');
  console.log('APP_ENV:', Config.APP_ENV);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', Config.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY exists:',
    !!Config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  console.log('GOOGLE_MAPS_API_KEY exists:', !!Config.GOOGLE_MAPS_API_KEY);
  console.log('All Config keys:', Object.keys(Config));
  console.log('Config object type:', typeof Config);
  console.log('Config is empty?', Object.keys(Config).length === 0);
};
