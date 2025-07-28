// Simple debug utility to check environment variables
export const debugEnvironment = () => {
  console.log('🔧 Environment Debug Information:');
  
  try {
    const env = require('@env');
    console.log('APP_ENV:', env.APP_ENV);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY exists:',
      !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    console.log('GOOGLE_MAPS_API_KEY exists:', !!env.GOOGLE_MAPS_API_KEY);
  } catch (error) {
    console.error('❌ Failed to load environment variables for debug:', error);
    console.log('Environment variables are not available or improperly configured');
  }
};
