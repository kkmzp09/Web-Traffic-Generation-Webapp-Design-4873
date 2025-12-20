-- Add DataForSEO task tracking columns to seo_scan_history
-- Run this migration to enable real SEO scan lifecycle tracking

ALTER TABLE seo_scan_history 
ADD COLUMN IF NOT EXISTS dataforseo_task_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'queued',
ADD COLUMN IF NOT EXISTS max_pages INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS pages_crawled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for task ID lookups
CREATE INDEX IF NOT EXISTS idx_seo_scan_history_task_id ON seo_scan_history(dataforseo_task_id);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_seo_scan_history_status ON seo_scan_history(status, scanned_at DESC);

-- Status values: 'queued', 'running', 'completed', 'failed'

COMMENT ON COLUMN seo_scan_history.dataforseo_task_id IS 'DataForSEO On-Page task ID';
COMMENT ON COLUMN seo_scan_history.status IS 'Scan status: queued, running, completed, failed';
COMMENT ON COLUMN seo_scan_history.max_pages IS 'Maximum pages allowed by plan';
COMMENT ON COLUMN seo_scan_history.pages_crawled IS 'Actual pages crawled';
COMMENT ON COLUMN seo_scan_history.error_message IS 'Error details if scan failed';
