-- Add DataForSEO On-Page columns to seo_scans table

-- Add dataforseo_task_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'seo_scans' 
        AND column_name = 'dataforseo_task_id'
    ) THEN
        ALTER TABLE seo_scans 
        ADD COLUMN dataforseo_task_id VARCHAR(255);
        
        CREATE INDEX IF NOT EXISTS idx_seo_scans_dataforseo_task 
        ON seo_scans(dataforseo_task_id);
        
        RAISE NOTICE 'Added dataforseo_task_id column';
    END IF;
END $$;

-- Add pages_crawled column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'seo_scans' 
        AND column_name = 'pages_crawled'
    ) THEN
        ALTER TABLE seo_scans 
        ADD COLUMN pages_crawled INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added pages_crawled column';
    END IF;
END $$;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'seo_scans'
ORDER BY ordinal_position;
