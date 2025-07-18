#!/bin/bash

# Deploy Supabase Edge Functions for Border Crossing Data Scraping
# Run this script from the BorderCrossApp directory

echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Login to Supabase (if not already logged in)
echo "🔐 Checking Supabase authentication..."
supabase status 2>/dev/null || {
    echo "Please login to Supabase:"
    supabase login
}

# Deploy the scraping function
echo "📡 Deploying scrape-traffic-data function..."
supabase functions deploy scrape-traffic-data --project-ref tcvilrjnpiaphhzluawr

# Deploy the cron job function
echo "⏰ Deploying update-wait-times function..."
supabase functions deploy update-wait-times --project-ref tcvilrjnpiaphhzluawr

echo "✅ Functions deployed successfully!"

# Set up environment variables
echo "🔧 Setting up environment variables..."
echo "Please set the following environment variables in your Supabase dashboard:"
echo "- NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL"
echo "- SB_SERVICE_ROLE_KEY: Your service role key (keep this secret!)"

echo ""
echo "📋 Next steps:"
echo "1. Go to https://supabase.com/dashboard/project/tcvilrjnpiaphhzluawr/functions"
echo "2. Navigate to Edge Functions"
echo "3. Set up the cron job for update-wait-times to run every 5 minutes"
echo "4. Test the functions manually first"
echo "5. Check logs for any errors during execution"

echo ""
echo "🔗 Function URLs:"
echo "- Scraper: https://tcvilrjnpiaphhzluawr.supabase.co/functions/v1/scrape-traffic-data"
echo "- Cron Job: https://tcvilrjnpiaphhzluawr.supabase.co/functions/v1/update-wait-times"