-- Add missing columns to existing seo_scans table

ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS dataforseo_task_id VARCHAR(255);
ALTER TABLE seo_scans ADD COLUMN IF NOT EXISTS pages_crawled INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seo_scans_dataforseo_task ON seo_scans(dataforseo_task_id);

SELECT 'Columns added successfully' as status;
