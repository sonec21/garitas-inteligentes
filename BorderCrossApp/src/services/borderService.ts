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
      console.log('📡 Calling Supabase Edge Function: get-border-data');
      // Call our Edge Function for real-time data
      const { data, error } = await supabase.functions.invoke(
        'get-border-data',
        {
          body: {},
        },
      );

      if (error) {
        console.error('❌ Edge function error:', error);
        return this.getFallbackData();
      }

      console.log('✅ Edge function response:', data);

      // Process the data to ensure compatibility
      if (data.data && Array.isArray(data.data)) {
        return data.data.map(crossing => ({
          ...crossing,
          lanes: crossing.lanes.map(adaptLane),
        }));
      }

      return this.getFallbackData();
    } catch (error) {
      console.error('❌ Error fetching border crossings:', error);
      console.log('🔄 Falling back to direct database query');
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
    console.log('🔍 Attempting direct database query as fallback');
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('border_crossings')
        .select(
          `
          *,
          lanes (
            *,
            accidents (*)
          )
        `,
        )
        .eq('status', 'open');

      if (error) {
        console.error('❌ Fallback query error:', error);
        console.log('🔄 Returning empty array due to database error');
        return [];
      }

      // Process the data to ensure compatibility
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(
          '✅ Fallback query successful, got',
          data.length,
          'crossings',
        );
        return data.map(crossing => ({
          ...crossing,
          lanes: crossing.lanes.map(adaptLane),
        }));
      }

      console.log('⚠️ No data from fallback query, returning empty array');
      return [];
    } catch (error) {
      console.error('❌ Error in fallback query:', error);
      console.log('🔄 Returning empty array due to error');
      return [];
    }
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