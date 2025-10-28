-- Fix seo_monitoring table structure

-- Add pages_scanned_this_month if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'seo_monitoring' 
        AND column_name = 'pages_scanned_this_month'
    ) THEN
        ALTER TABLE seo_monitoring 
        ADD COLUMN pages_scanned_this_month INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added pages_scanned_this_month column';
    END IF;
END $$;

-- Add last_reset if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'seo_monitoring' 
        AND column_name = 'last_reset'
    ) THEN
        ALTER TABLE seo_monitoring 
        ADD COLUMN last_reset TIMESTAMP DEFAULT NOW();
        
        RAISE NOTICE 'Added last_reset column';
    END IF;
END $$;

-- Ensure user_id is unique (for ON CONFLICT to work)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'seo_monitoring' 
        AND indexname = 'seo_monitoring_user_id_key'
    ) THEN
        ALTER TABLE seo_monitoring 
        ADD CONSTRAINT seo_monitoring_user_id_key UNIQUE (user_id);
        
        RAISE NOTICE 'Added unique constraint on user_id';
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'Unique constraint already exists';
END $$;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'seo_monitoring'
ORDER BY ordinal_position;
