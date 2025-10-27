-- Create tables for automated SEO monitoring

-- Add monitoring columns to seo_scans table
ALTER TABLE seo_scans 
ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_fix_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scan_frequency VARCHAR(20) DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS target_keywords TEXT[],
ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_scan_at TIMESTAMP;

-- Create ranking history table
CREATE TABLE IF NOT EXISTS ranking_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  domain VARCHAR(255) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  search_engine VARCHAR(50) DEFAULT 'google',
  location VARCHAR(100) DEFAULT 'US',
  recorded_at TIMESTAMP DEFAULT NOW(),
  previous_position INTEGER,
  change_direction VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_ranking_history_domain ON ranking_history(domain);
CREATE INDEX IF NOT EXISTS idx_ranking_history_keyword ON ranking_history(keyword);
CREATE INDEX IF NOT EXISTS idx_ranking_history_recorded_at ON ranking_history(recorded_at);

-- Create competitor analysis table
CREATE TABLE IF NOT EXISTS competitor_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  domain VARCHAR(255) NOT NULL,
  competitor_url VARCHAR(500) NOT NULL,
  keyword VARCHAR(255) NOT NULL,
  competitor_position INTEGER,
  competitor_score INTEGER,
  strengths TEXT[],
  weaknesses TEXT[],
  analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_domain ON competitor_analysis(domain);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_keyword ON competitor_analysis(keyword);

-- Create auto-fix history table
CREATE TABLE IF NOT EXISTS auto_fix_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  domain VARCHAR(255) NOT NULL,
  scan_id INTEGER,
  fix_type VARCHAR(100) NOT NULL,
  issue_title VARCHAR(500),
  before_value TEXT,
  after_value TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'applied',
  impact_score INTEGER
);

CREATE INDEX IF NOT EXISTS idx_auto_fix_history_domain ON auto_fix_history(domain);
CREATE INDEX IF NOT EXISTS idx_auto_fix_history_applied_at ON auto_fix_history(applied_at);

-- Create email reports table
CREATE TABLE IF NOT EXISTS email_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  domain VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) DEFAULT 'automated_scan',
  sent_at TIMESTAMP DEFAULT NOW(),
  email_to VARCHAR(255),
  subject VARCHAR(500),
  fixes_count INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_email_reports_user_id ON email_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_email_reports_sent_at ON email_reports(sent_at);

COMMENT ON TABLE ranking_history IS 'Tracks keyword ranking positions over time';
COMMENT ON TABLE competitor_analysis IS 'Stores competitor analysis data from SERP';
COMMENT ON TABLE auto_fix_history IS 'Records all automatically applied SEO fixes';
COMMENT ON TABLE email_reports IS 'Logs all sent email reports';
