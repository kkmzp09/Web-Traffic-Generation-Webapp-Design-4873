-- Create seo_scans table for DataForSEO On-Page integration

SET search_path TO public;

CREATE TABLE IF NOT EXISTS public.seo_scans (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  dataforseo_task_id VARCHAR(255),
  pages_crawled INTEGER DEFAULT 0,
  seo_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_seo_scans_user_id ON seo_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_scans_dataforseo_task ON seo_scans(dataforseo_task_id);
CREATE INDEX IF NOT EXISTS idx_seo_scans_status ON seo_scans(status);

-- Show result
SELECT 'seo_scans table created successfully' as status;
