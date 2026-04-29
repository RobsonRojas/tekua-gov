-- Utility Script to set Notification Settings in Supabase Postgres
-- Replace placeholders with actual values from your Supabase Dashboard

-- Set the Supabase Project URL (e.g., https://xyz.supabase.co)
ALTER DATABASE postgres SET "app.settings.supabase_url" = 'https://rhpcenqbelifilylwujy.supabase.co';

-- Set the Service Role Key (Found in Project Settings -> API)
ALTER DATABASE postgres SET "app.settings.service_role_key" = 'SUA_SERVICE_ROLE_KEY_AQUI';

-- Verify settings
SELECT 
    current_setting('app.settings.supabase_url', true) as url,
    current_setting('app.settings.service_role_key', true) as key_configured;

-- NOTE: You may need to reconnect your database client for settings to take effect in the current session.
