-- SEO Scan History Table
-- Stores historical scan results for each website

CREATE TABLE IF NOT EXISTS seo_scan_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  issues JSONB,
  summary JSONB,
  page_data JSONB,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_seo_scan_history_user_url ON seo_scan_history(user_id, url);
CREATE INDEX IF NOT EXISTS idx_seo_scan_history_scanned_at ON seo_scan_history(scanned_at DESC);

-- Sample query to get latest scan for a user
-- SELECT * FROM seo_scan_history WHERE user_id = 'user123' AND url = 'https://example.com' ORDER BY scanned_at DESC LIMIT 1;
