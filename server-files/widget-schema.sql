-- Widget System Database Schema
-- Tracks installed widgets and enables real-time SEO fix application

-- Table: widget_installations
-- Tracks which websites have the widget installed
CREATE TABLE IF NOT EXISTS widget_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id VARCHAR(100) UNIQUE NOT NULL, -- Unique identifier for each site
  domain VARCHAR(255) NOT NULL,
  widget_key VARCHAR(100) UNIQUE NOT NULL, -- Secret key for authentication
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  last_ping TIMESTAMP, -- Last time widget connected
  installed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: widget_fix_queue
-- Queue of fixes waiting to be applied via widget
CREATE TABLE IF NOT EXISTS widget_fix_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id VARCHAR(100) NOT NULL,
  fix_id UUID NOT NULL,
  fix_type VARCHAR(50) NOT NULL, -- title, meta, h1, alt, schema
  target_selector VARCHAR(255), -- CSS selector for element to modify
  fix_data JSONB NOT NULL, -- The actual fix content
  status VARCHAR(20) DEFAULT 'pending', -- pending, applied, failed
  applied_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (site_id) REFERENCES widget_installations(site_id) ON DELETE CASCADE
);

-- Table: widget_activity_log
-- Logs all widget activities for debugging
CREATE TABLE IF NOT EXISTS widget_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id VARCHAR(100) NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- ping, fix_applied, error, install
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (site_id) REFERENCES widget_installations(site_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_widget_installations_user_id ON widget_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_installations_site_id ON widget_installations(site_id);
CREATE INDEX IF NOT EXISTS idx_widget_fix_queue_site_id ON widget_fix_queue(site_id);
CREATE INDEX IF NOT EXISTS idx_widget_fix_queue_status ON widget_fix_queue(status);
CREATE INDEX IF NOT EXISTS idx_widget_activity_log_site_id ON widget_activity_log(site_id);
CREATE INDEX IF NOT EXISTS idx_widget_activity_log_created_at ON widget_activity_log(created_at);

-- View: widget_dashboard_summary
-- Summary stats for widget installations
CREATE OR REPLACE VIEW widget_dashboard_summary AS
SELECT 
  user_id,
  COUNT(*) as total_installations,
  COUNT(*) FILTER (WHERE status = 'active') as active_installations,
  COUNT(*) FILTER (WHERE last_ping > NOW() - INTERVAL '5 minutes') as online_installations,
  MAX(installed_at) as last_installation
FROM widget_installations
GROUP BY user_id;
