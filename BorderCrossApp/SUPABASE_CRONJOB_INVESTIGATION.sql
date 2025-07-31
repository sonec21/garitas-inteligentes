-- SUPABASE CRON JOB INVESTIGATION AND STOP QUERIES
-- Run these queries in your Supabase SQL Editor

-- 1. CHECK ALL ACTIVE CRON JOBS
-- This will show all scheduled jobs in pg_cron
SELECT 
    jobid,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active,
    jobname
FROM cron.job
ORDER BY jobid;

-- 2. CHECK CRON JOB EXECUTION HISTORY
-- This shows recent job runs and their status
SELECT 
    runid,
    jobid,
    database,
    username,
    command,
    status,
    return_message,
    start_time,
    end_time
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- 3. STOP ALL ACTIVE CRON JOBS
-- This will unschedule all cron jobs
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE active = true;

-- 4. ALTERNATIVE: STOP SPECIFIC CRON JOB BY ID
-- Replace 'JOB_ID' with the actual job ID from query #1
-- SELECT cron.unschedule('JOB_ID');

-- 5. ALTERNATIVE: STOP CRON JOBS BY NAME PATTERN
-- This stops jobs that match a specific pattern in the command
-- Uncomment and modify as needed:
-- SELECT cron.unschedule(jobid) 
-- FROM cron.job 
-- WHERE command LIKE '%your_function_name%' AND active = true;

-- 6. VERIFY ALL JOBS ARE STOPPED
-- Run this after stopping to confirm no active jobs remain
SELECT 
    jobid,
    schedule,
    command,
    active,
    jobname
FROM cron.job
WHERE active = true;

-- 7. CHECK FOR SUPABASE EDGE FUNCTIONS THAT MIGHT BE SCHEDULED
-- This checks if you have any Edge Functions that might be called by cron
SELECT 
    id,
    name,
    status,
    created_at,
    updated_at
FROM supabase_functions.functions;

-- 8. EMERGENCY: DROP ALL CRON JOBS (USE WITH CAUTION)
-- Only use this if you want to completely remove all cron job definitions
-- DELETE FROM cron.job;

-- NOTES:
-- - Run queries 1 and 2 first to understand what's currently running
-- - Query 3 will stop all active cron jobs safely
-- - Query 6 confirms everything is stopped
-- - Keep a backup of your job definitions if you plan to restart them later