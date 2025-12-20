-- Migration: Add page-level SEO scan tables
-- Purpose: Store Cheerio-based page scan results for fix generation

-- Table: seo_page_scans
-- Stores individual page scan results with detected issues
CREATE TABLE IF NOT EXISTS seo_page_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT,
  meta_description TEXT,
  h1_tags TEXT[],
  image_count INTEGER DEFAULT 0,
  images_without_alt INTEGER DEFAULT 0,
  has_canonical BOOLEAN DEFAULT false,
  is_noindex BOOLEAN DEFAULT false,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  scan_success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_scans_scan_id ON seo_page_scans(scan_id);
CREATE INDEX IF NOT EXISTS idx_page_scans_page_url ON seo_page_scans(page_url);
CREATE INDEX IF NOT EXISTS idx_page_scans_created_at ON seo_page_scans(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE seo_page_scans IS 'Stores page-level SEO scan results from Cheerio scanner';
COMMENT ON COLUMN seo_page_scans.issues IS 'JSONB array of detected SEO issues with type, severity, and fix info';
COMMENT ON COLUMN seo_page_scans.scan_success IS 'Whether the page scan completed successfully';
