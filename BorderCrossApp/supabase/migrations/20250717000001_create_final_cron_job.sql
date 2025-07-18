-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a security definer function to encapsulate the HTTP request
CREATE OR REPLACE FUNCTION trigger_update_wait_times() 
RETURNS void AS $$
DECLARE
  service_key text;
  anon_key text;
BEGIN
  -- Securely retrieve secrets from the Vault using standard Supabase names
  select decrypted_secret into service_key from vault.decrypted_secrets where name = 'SB_SERVICE_ROLE_KEY';
  select decrypted_secret into anon_key from vault.decrypted_secrets where name = 'SB_ANON_KEY';

  -- Perform the HTTP POST request
  PERFORM net.http_post(
    url := 'https://tcvilrjnpiaphhzluawr.supabase.co/functions/v1/update-wait-times',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key,
      'apikey', anon_key
    ),
    body := jsonb_build_object('source', 'cron')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unschedule any existing jobs to ensure a clean slate
SELECT cron.unschedule('update-border-wait-times');
SELECT cron.unschedule('update-wait-times-v2');

-- Schedule the new cron job to run the security definer function
SELECT cron.schedule(
  'update-wait-times-final', -- A new, unique job name
  '*/5 * * * *',
  'SELECT trigger_update_wait_times();'
);