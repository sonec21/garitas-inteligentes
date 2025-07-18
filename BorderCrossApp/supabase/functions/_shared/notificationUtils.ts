export async function sendUpdateNotification(supabaseClient: any, updateResult: any) {
  try {
    // Log the update for monitoring
    const { error } = await supabaseClient.from('scraping_logs').insert({
      timestamp: new Date().toISOString(),
      crossings_updated: updateResult.crossings_updated,
      lanes_updated: updateResult.lanes_updated,
      status: 'success',
      source: 'cron',
    });

    if (error) {
      console.warn('Error logging scraping result:', error);
    }

    // Optional: Send notifications to users about significant changes
    // This could trigger push notifications for high wait times, etc.
  } catch (error) {
    console.warn('Error sending update notification:', error);
  }
}