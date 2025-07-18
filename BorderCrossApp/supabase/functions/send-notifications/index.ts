import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, errorResponse } from '../_shared/utils.ts';
import { getSupabaseClient } from '../_shared/supabaseClient.ts';

interface NotificationPayload {
  user_id?: string;
  crossing_id?: string;
  type: 'wait_time_alert' | 'lane_closure' | 'accident_report' | 'general';
  title: string;
  message: string;
  data?: any;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = getSupabaseClient();

    const payload: NotificationPayload = await req.json();

    // Get user preferences for notifications
    let targetUsers = [];

    if (payload.user_id) {
      // Send to specific user
      targetUsers = [payload.user_id];
    } else if (payload.crossing_id) {
      // Send to users who have this crossing as preferred
      const { data: preferences } = await supabaseClient
        .from('user_preferences')
        .select('user_id')
        .contains('preferred_crossings', [payload.crossing_id])
        .eq('notifications', true);

      targetUsers = preferences?.map(p => p.user_id) || [];
    } else {
      // Send to all users with notifications enabled
      const { data: preferences } = await supabaseClient
        .from('user_preferences')
        .select('user_id')
        .eq('notifications', true);

      targetUsers = preferences?.map(p => p.user_id) || [];
    }

    // In production, integrate with:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNs)
    // - OneSignal
    // - Expo Push Notifications

    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data || {},
      sent_at: new Date().toISOString(),
      read: false,
    }));

    // Store notifications in database
    const { error: _insertError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    // Simulate sending push notifications
    console.log(`Sending ${notifications.length} notifications:`, {
      type: payload.type,
      title: payload.title,
      message: payload.message,
    });

    // Here you would integrate with your push notification service
    // Example with Expo:
    /*
    const messages = notifications.map(notification => ({
      to: notification.user_id, // This would be the push token
      sound: 'default',
      title: payload.title,
      body: payload.message,
      data: payload.data,
    }))
    
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })
    */

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: notifications.length,
        type: payload.type,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});