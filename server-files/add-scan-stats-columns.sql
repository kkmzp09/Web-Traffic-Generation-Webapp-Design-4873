-- Add pages_scanned and pages_skipped columns to seo_scans table

ALTER TABLE seo_scans 
ADD COLUMN IF NOT EXISTS pages_scanned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pages_skipped INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN seo_scans.pages_scanned IS 'Number of pages actually scanned';
COMMENT ON COLUMN seo_scans.pages_skipped IS 'Number of pages skipped (had pending issues)';

-- Update existing records to have default values
UPDATE seo_scans 
SET pages_scanned = 1, pages_skipped = 0 
WHERE pages_scanned IS NULL OR pages_scanned = 0;
