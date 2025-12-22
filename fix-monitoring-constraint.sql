-- Fix seo_monitoring table constraint issue
-- The table should allow multiple pages per user

-- First, check current constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'seo_monitoring';

-- Drop the problematic unique constraint
ALTER TABLE seo_monitoring DROP CONSTRAINT IF EXISTS seo_monitoring_user_id_key;

-- Add a proper composite unique constraint (user_id + url + measured_at)
-- This allows multiple pages per user, but prevents duplicate scans of the same page at the same time
ALTER TABLE seo_monitoring 
ADD CONSTRAINT seo_monitoring_user_url_time_key 
UNIQUE (user_id, url, measured_at);

-- Verify the fix
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'seo_monitoring';
