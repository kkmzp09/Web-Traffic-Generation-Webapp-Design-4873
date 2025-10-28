-- Create websites table for managing multiple websites per user

CREATE TABLE IF NOT EXISTS user_websites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  domain VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  widget_status VARCHAR(50) DEFAULT 'not_connected', -- 'connected', 'not_connected', 'checking'
  last_widget_check TIMESTAMP,
  last_scan_date TIMESTAMP,
  total_scans INTEGER DEFAULT 0,
  avg_seo_score INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'deleted'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_websites_user_id ON user_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_websites_domain ON user_websites(domain);

-- Add comment
COMMENT ON TABLE user_websites IS 'Stores websites added by users for SEO monitoring';
COMMENT ON COLUMN user_websites.widget_status IS 'Widget installation status: connected, not_connected, checking';
