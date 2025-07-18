# 🕷️ Border Crossing Data Scraper Setup

This guide will help you set up automated scraping of https://traficogaritas.com/ every 5 minutes using Supabase Edge Functions and cron jobs.

## 📋 Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install globally with `npm install -g supabase`
3. **Database Schema**: Run the SQL from `supabase/seed.sql`

## 🚀 Quick Setup

### 1. Deploy Edge Functions

```bash
# Navigate to your project directory
cd BorderCrossApp

# Make the deploy script executable
chmod +x scripts/deploy-functions.sh

# Deploy the functions
./scripts/deploy-functions.sh
```

### 2. Manual Deployment (Alternative)

```bash
# Login to Supabase
supabase login

# Deploy scraping function
supabase functions deploy scrape-traffic-data

# Deploy cron job function
supabase functions deploy update-wait-times
```

### 3. Set Environment Variables

In your Supabase Dashboard → Settings → Edge Functions, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SB_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Set Up Cron Job

#### Option A: Using Supabase Cron (Recommended)

1. Go to Supabase Dashboard → Database → Extensions
2. Enable the `pg_cron` extension
3. Run this SQL in the SQL Editor:

```sql
-- Create a cron job to run every 5 minutes
SELECT cron.schedule(
  'update-border-wait-times',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/update-wait-times',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer '',
    body := '{}'::jsonb
  );
  $$
);
```

#### Option B: Using External Cron Service

Use services like:

- **Cron-job.org** (free)
- **EasyCron**
- **GitHub Actions** (see below)

Set up a GET/POST request to:

```
https://your-project.supabase.co/functions/v1/update-wait-times
```

#### Option C: GitHub Actions Cron

Create `.github/workflows/scraper.yml`:

```yaml
name: Border Crossing Data Scraper
on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes
  workflow_dispatch: # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraper
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SB_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://your-project.supabase.co/functions/v1/update-wait-times
```

## 🧪 Testing

### Test the Scraper Function

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://your-project.supabase.co/functions/v1/scrape-traffic-data
```

### Test the Cron Function

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://your-project.supabase.co/functions/v1/update-wait-times
```

### Check Database Updates

```sql
-- Check recent lane updates
SELECT
  bc.name as crossing_name,
  l.name as lane_name,
  l.wait_time,
  l.traffic_flow,
  l.updated_at
FROM lanes l
JOIN border_crossings bc ON l.crossing_id = bc.id
ORDER BY l.updated_at DESC
LIMIT 20;
```

## 📊 Monitoring

### Create Logging Table

```sql
-- Create table to track scraping activity
CREATE TABLE scraping_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crossings_updated INTEGER DEFAULT 0,
  lanes_updated INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success',
  source TEXT DEFAULT 'manual',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Monitor Scraping Activity

```sql
-- Check recent scraping activity
SELECT * FROM scraping_logs
ORDER BY timestamp DESC
LIMIT 10;

-- Check success rate
SELECT
  status,
  COUNT(*) as count,
  AVG(lanes_updated) as avg_lanes_updated
FROM scraping_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY status;
```

## 🔧 Customization

### Adjust Scraping Frequency

Change the cron schedule:

- Every minute: `* * * * *`
- Every 10 minutes: `*/10 * * * *`
- Every hour: `0 * * * *`
- Every 30 minutes: `*/30 * * * *`

### Add More Data Sources

1. Create new parser functions in `supabase/functions/scrape-traffic-data/parser.ts`
2. Add new scraping logic for additional websites
3. Update the main scraper to call multiple sources

### Custom Notifications

Add notification logic in `update-wait-times/index.ts`:

```typescript
// Example: Send alert for high wait times
if (lane.wait_time > 90) {
  await supabase.functions.invoke('send-notifications', {
    body: {
      type: 'high_wait_time',
      crossing_id: crossingId,
      message: `High wait time: ${lane.wait_time} minutes at ${crossing.name}`,
    },
  });
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Functions not deploying**: Check Supabase CLI version and login status
2. **Scraping fails**: Website structure may have changed, update parser
3. **Cron not running**: Verify pg_cron extension is enabled
4. **Database errors**: Check table schema matches expected structure

### Debug Logs

Check function logs in Supabase Dashboard → Edge Functions → Logs

### Manual Testing

Test individual components:

```bash
# Test website accessibility
curl -I https://traficogaritas.com/

# Test function deployment
supabase functions list

# Test database connection
supabase db reset --debug
```

## 📈 Performance Optimization

### Rate Limiting

Add delays between requests to avoid being blocked:

```typescript
// Add delay between scraping operations
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Caching

Implement caching to reduce redundant requests:

```typescript
// Cache results for 2 minutes
const cacheKey = `traffic_data_${Date.now()}`;
const cachedData = await redis.get(cacheKey);
```

### Error Handling

Implement retry logic:

```typescript
async function scrapeWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await scrapeTrafficData();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
    }
  }
}
```

## 🔐 Security

1. **Never commit service role keys** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** to prevent abuse
4. **Monitor function usage** for unusual activity
5. **Rotate keys regularly** in production

## 📞 Support

If you encounter issues:

1. Check the function logs in Supabase Dashboard
2. Verify the website structure hasn't changed
3. Test the functions manually first
4. Check database permissions and schema

## 🎯 Next Steps

1. **Deploy the functions** using the provided scripts
2. **Set up monitoring** to track scraping success
3. **Test the cron job** to ensure it runs every 5 minutes
4. **Monitor data quality** and adjust parsers as needed
5. **Add alerting** for scraping failures or data anomalies

The scraper will automatically keep your border crossing data fresh and up-to-date! 🚀
