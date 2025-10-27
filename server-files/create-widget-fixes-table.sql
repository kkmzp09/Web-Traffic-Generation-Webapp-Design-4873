-- Create table to store widget-based SEO fixes
CREATE TABLE IF NOT EXISTS widget_fixes (
  id SERIAL PRIMARY KEY,
  site_id VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
  fix_type VARCHAR(100) NOT NULL, -- meta_tags, schema, performance, content, technical
  fix_data JSONB NOT NULL, -- The actual fix configuration
  status VARCHAR(50) DEFAULT 'active', -- active, disabled, expired
  priority INTEGER DEFAULT 0, -- Higher priority fixes apply first
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP -- Optional expiration
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_widget_fixes_site_id ON widget_fixes(site_id);
CREATE INDEX IF NOT EXISTS idx_widget_fixes_domain ON widget_fixes(domain);
CREATE INDEX IF NOT EXISTS idx_widget_fixes_status ON widget_fixes(status);
CREATE INDEX IF NOT EXISTS idx_widget_fixes_scan_id ON widget_fixes(scan_id);

-- Create composite index for widget queries
CREATE INDEX IF NOT EXISTS idx_widget_fixes_site_status ON widget_fixes(site_id, status);

COMMENT ON TABLE widget_fixes IS 'Stores SEO fixes that are automatically applied by the widget';
COMMENT ON COLUMN widget_fixes.fix_type IS 'Type of fix: meta_tags, schema, performance, content, technical';
COMMENT ON COLUMN widget_fixes.fix_data IS 'JSON configuration for the fix to be applied by widget';
COMMENT ON COLUMN widget_fixes.priority IS 'Higher priority fixes are applied first (0-100)';
