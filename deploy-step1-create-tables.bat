@echo off
echo Creating database tables...
ssh root@67.217.60.57 "cd /root/relay && cat > create-all-tables.sql << 'EOF'
-- Widget Fixes Table
CREATE TABLE IF NOT EXISTS widget_fixes (
  id SERIAL PRIMARY KEY,
  site_id VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
  fix_type VARCHAR(100) NOT NULL,
  fix_data JSONB NOT NULL,
  priority INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  applied_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_widget_fixes_site_id ON widget_fixes(site_id);
CREATE INDEX IF NOT EXISTS idx_widget_fixes_active ON widget_fixes(is_active);

-- Ranking History Table
CREATE TABLE IF NOT EXISTS ranking_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

-- Competitor Analysis Table
CREATE TABLE IF NOT EXISTS competitor_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

-- Auto-Fix History Table
CREATE TABLE IF NOT EXISTS auto_fix_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
  fix_type VARCHAR(100) NOT NULL,
  issue_title VARCHAR(500),
  before_value TEXT,
  after_value TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'applied',
  impact_score INTEGER
);

CREATE INDEX IF NOT EXISTS idx_auto_fix_history_domain ON auto_fix_history(domain);

-- Email Reports Table
CREATE TABLE IF NOT EXISTS email_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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

-- Add monitoring columns to seo_scans
ALTER TABLE seo_scans 
ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_fix_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS scan_frequency VARCHAR(20) DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS target_keywords TEXT[],
ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_scan_at TIMESTAMP;
EOF
"

echo SQL file created. Now executing...
ssh root@67.217.60.57 "cd /root/relay && node -e \"require('dotenv').config(); const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const sql = fs.readFileSync('create-all-tables.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ All tables created successfully'); pool.end(); }).catch(err => { console.error('❌ Error:', err); pool.end(); process.exit(1); });\""

echo Done!
pause
