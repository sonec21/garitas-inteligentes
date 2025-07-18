// Cron job configuration for Supabase Edge Functions
// This file defines the scheduled tasks for our border crossing app

export const cronJobs = [
  {
    name: 'scrape-traffic-data',
    schedule: '*/5 * * * *', // Every 5 minutes
    function_name: 'scrape-traffic-data',
    description: 'Scrape traffic data from traficogaritas.com every 5 minutes',
  },
  {
    name: 'cleanup-old-data',
    schedule: '0 2 * * *', // Daily at 2 AM
    function_name: 'cleanup-old-data',
    description: 'Clean up old traffic data older than 7 days',
  },
];

// Helper function to validate cron expressions
export function isValidCronExpression(expression: string): boolean {
  const cronRegex =
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
  return cronRegex.test(expression);
}
