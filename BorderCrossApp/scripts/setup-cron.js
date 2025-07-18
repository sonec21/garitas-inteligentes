#!/usr/bin/env node

/**
 * Script to set up Supabase cron jobs for the Garita Inteligente app
 * This script will:
 * 1. Deploy the scraping Edge Function
 * 2. Set up a cron job to run every 5 minutes
 * 3. Configure the database triggers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase cron jobs for Garita Inteligente...\n');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is installed');
} catch (error) {
  console.error('❌ Supabase CLI is not installed. Please install it first:');
  console.error('npm install -g supabase');
  process.exit(1);
}

// Check if we're in the right directory
const currentDir = process.cwd();
const supabaseDir = path.join(currentDir, 'supabase');

if (!fs.existsSync(supabaseDir)) {
  console.error(
    "❌ Supabase directory not found. Make sure you're in the project root.",
  );
  process.exit(1);
}

console.log('✅ Found Supabase directory');

try {
  // 1. Deploy the scraping Edge Function
  console.log('\n📦 Deploying scrape-traffic-data Edge Function...');
  execSync('supabase functions deploy scrape-traffic-data', {
    stdio: 'inherit',
    cwd: currentDir,
  });
  console.log('✅ Edge Function deployed successfully');

  // 2. Set up the cron job using pg_cron extension
  console.log('\n⏰ Setting up cron job...');

  const cronSQL = `
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the scraping job to run every 5 minutes
SELECT cron.schedule(
  'scrape-traffic-data',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/scrape-traffic-data',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Check if the job was scheduled
SELECT * FROM cron.job;
  `;

  // Write the SQL to a temporary file
  const tempSQLFile = path.join(currentDir, 'temp-cron-setup.sql');
  fs.writeFileSync(tempSQLFile, cronSQL);

  console.log('📝 Created cron job SQL script');
  console.log('\n⚠️  MANUAL STEP REQUIRED:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run the following SQL commands:');
  console.log('\n' + cronSQL);
  console.log(
    '\n4. Replace "your-project" with your actual Supabase project URL',
  );
  console.log(
    '5. Make sure to set up the service role key in your project settings',
  );

  // Clean up temp file
  fs.unlinkSync(tempSQLFile);

  console.log('\n✅ Setup script completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Complete the manual SQL setup in Supabase dashboard');
  console.log('2. Test the scraper by calling the Edge Function manually');
  console.log('3. Monitor the cron job logs in Supabase');
  console.log('4. Update your React Native app to use real-time data');
} catch (error) {
  console.error('\n❌ Error during setup:', error.message);
  console.error('\nTroubleshooting:');
  console.error("1. Make sure you're logged into Supabase CLI: supabase login");
  console.error(
    '2. Make sure your project is linked: supabase link --project-ref YOUR_PROJECT_ID',
  );
  console.error('3. Check your internet connection');
  process.exit(1);
}
