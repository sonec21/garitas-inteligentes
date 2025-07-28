import { BorderCrossing, adaptLane } from '../types';

// Dynamically import supabase to ensure it's initialized when needed
async function getSupabaseClient() {
  const { supabase } = await import('../config/supabase');
  return supabase;
}

export class GaritaService {
  // Get all border crossings with real-time data
  static async getBorderCrossings(): Promise<BorderCrossing[]> {
    console.log('🔍 GaritaService.getBorderCrossings called');

    try {
      const supabase = await getSupabaseClient();
      console.log('✅ Supabase client initialized successfully');
      
      console.log('📡 Calling Supabase Edge Function: get-border-data');
      // Call our Edge Function for real-time data with optimized query
      const { data, error } = await supabase.functions.invoke(
        'get-border-data',
        {
          body: {
            latest_only: true,
            fields: [
              'id', 'name', 'location', 'status', 'last_updated',
              'lanes.id', 'lanes.name', 'lanes.type', 'lanes.status',
              'lanes.wait_time', 'lanes.vehicle_count', 'lanes.traffic_flow',
              'lanes.updated_at'
            ]
          },
        },
      );

      if (error) {
        console.error('❌ Edge function error:', JSON.stringify(error, null, 2));
        console.log('🔄 Falling back to direct database query due to edge function error');
        return this.getFallbackData();
      }

      console.log('✅ Edge function response received:', JSON.stringify(data, null, 2));

      // Process the data to ensure compatibility
      if (data && data.data && Array.isArray(data.data)) {
        console.log('📋 Processing', data.data.length, 'border crossings from edge function');
        return data.data.map(crossing => ({
          ...crossing,
          lanes: crossing.lanes ? crossing.lanes.map(adaptLane) : [],
        }));
      }

      console.log('⚠️ No valid data from edge function, falling back to database');
      return this.getFallbackData();
    } catch (error) {
      console.error('❌ Error fetching border crossings:', JSON.stringify(error, null, 2));
      console.log('🔄 Falling back to direct database query due to exception');
      // Fallback to direct database query
      return this.getFallbackData();
    }
  }

  // Get specific border crossing
  static async getBorderCrossing(
    crossingId: string,
  ): Promise<BorderCrossing | null> {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.functions.invoke(
        'get-border-data',
        {
          body: { crossing_id: crossingId },
        },
      );

      if (error) throw error;

      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching border crossing:', error);
      return null;
    }
  }

  // Subscribe to real-time updates
  static subscribeToUpdates(callback: (crossings: BorderCrossing[]) => void) {
    // Disable real-time updates for now to avoid errors
    console.log('⚠️ Real-time updates temporarily disabled');

    // Periodically refresh data instead of using real-time updates
    const intervalId = setInterval(async () => {
      console.log('🔄 Periodic refresh triggered');
      try {
        const crossings = await this.getBorderCrossings();
        callback(crossings);
      } catch (error) {
        console.error('❌ Error in periodic refresh:', error);
      }
    }, 30000); // Refresh every 30 seconds

    // Return an object that mimics a Supabase subscription
    return {
      unsubscribe: () => {
        console.log('Clearing periodic refresh interval');
        clearInterval(intervalId);
      },
    };
  }

  // Send notification for significant changes
  static async sendWaitTimeAlert(crossingId: string, waitTime: number) {
    try {
      const supabase = await getSupabaseClient();
      await supabase.functions.invoke('send-notifications', {
        body: {
          crossing_id: crossingId,
          type: 'wait_time_alert',
          title: 'High Wait Time Alert',
          message: `Wait time is now ${waitTime} minutes`,
          data: { crossing_id: crossingId, wait_time: waitTime },
        },
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Fallback data when Edge Functions are unavailable
  private static async getFallbackData(): Promise<BorderCrossing[]> {
    console.log('🔍 Attempting optimized direct database query as fallback');
    try {
      const supabase = await getSupabaseClient();
      console.log('📊 Running optimized query to get latest lane data...');
      
      // First, get all border crossings
      const { data: crossingsData, error: crossingsError } = await supabase
        .from('border_crossings')
        .select('id, name, location, status, last_updated')
        .eq('status', 'open');

      if (crossingsError) {
        console.error('❌ Crossings query error:', JSON.stringify(crossingsError, null, 2));
        console.log('🔄 Returning test data due to crossings error');
        return this.getTestData();
      }

      if (!crossingsData || crossingsData.length === 0) {
        console.log('⚠️ No crossings found, returning test data');
        return this.getTestData();
      }

      console.log('✅ Found', crossingsData.length, 'border crossings');

      // For each crossing, get the latest lane data
      const crossingsWithLanes = await Promise.all(
        crossingsData.map(async (crossing) => {
          const { data: lanesData, error: lanesError } = await supabase
            .from('lanes')
            .select(`
              id, name, type, status, wait_time, vehicle_count, 
              traffic_flow, updated_at
            `)
            .eq('crossing_id', crossing.id)
            .eq('status', 'open')
            .order('updated_at', { ascending: false })
            .limit(10); // Limit to 10 most recent lanes per crossing

          if (lanesError) {
            console.error(`❌ Lanes query error for crossing ${crossing.id}:`, lanesError);
            return {
              ...crossing,
              lastUpdated: crossing.last_updated,
              lanes: []
            };
          }

          return {
            ...crossing,
            lastUpdated: crossing.last_updated,
            lanes: lanesData ? lanesData.map(adaptLane) : []
          };
        })
      );

      console.log('✅ Processed crossings with latest lane data');
      console.log('📋 Sample processed data:', JSON.stringify(crossingsWithLanes[0], null, 2));
      
      return crossingsWithLanes.filter(crossing => crossing.lanes.length > 0);

    } catch (error) {
      console.error('❌ Error in optimized fallback query:', JSON.stringify(error, null, 2));
      console.log('🔄 Returning test data due to error');
      return this.getTestData();
    }
  }

  // Test data for development
  private static getTestData(): BorderCrossing[] {
    console.log('🧪 Returning test data');
    return [
      {
        id: 'test-1',
        name: 'San Ysidro',
        location: { latitude: 32.5422, longitude: -117.0309 },
        status: 'open' as const,
        lastUpdated: new Date().toISOString(),
        lanes: [
          {
            id: 'lane-1',
            name: 'General Traffic',
            type: 'vehicle' as const,
            status: 'open' as const,
            wait_time: 25,
            vehicle_count: 45,
            traffic_flow: 'moderate' as const,
          },
          {
            id: 'lane-2', 
            name: 'SENTRI',
            type: 'sentri' as const,
            status: 'open' as const,
            wait_time: 5,
            vehicle_count: 12,
            traffic_flow: 'fast' as const,
          }
        ]
      },
      {
        id: 'test-2',
        name: 'Otay Mesa',
        location: { latitude: 32.5502, longitude: -117.0284 },
        status: 'open' as const,
        lastUpdated: new Date().toISOString(),
        lanes: [
          {
            id: 'lane-3',
            name: 'Commercial',
            type: 'vehicle' as const,
            status: 'open' as const,
            wait_time: 15,
            vehicle_count: 30,
            traffic_flow: 'fast' as const,
          }
        ]
      }
    ];
  }

  // Update user's preferred crossings
  static async updatePreferredCrossings(userId: string, crossingIds: string[]) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      preferred_crossings: crossingIds,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      throw error;
    }

    return data;
  }
}