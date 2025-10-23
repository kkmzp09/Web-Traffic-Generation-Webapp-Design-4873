-- SEO Automation Platform Database Schema
-- Run this on your Neon PostgreSQL database

-- Table: seo_scans
-- Stores each SEO scan performed on a page
CREATE TABLE IF NOT EXISTS seo_scans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    scan_type VARCHAR(50) DEFAULT 'full', -- 'full', 'quick', 'scheduled'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scanning', 'completed', 'failed'
    
    -- Overall scores
    seo_score INTEGER DEFAULT 0, -- 0-100
    performance_score INTEGER DEFAULT 0,
    accessibility_score INTEGER DEFAULT 0,
    
    -- Issue counts
    critical_issues INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    passed_checks INTEGER DEFAULT 0,
    
    -- Scan metadata
    scan_duration_ms INTEGER,
    scanned_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_user_scans (user_id, scanned_at DESC),
    INDEX idx_url_scans (url, scanned_at DESC),
    INDEX idx_domain_scans (domain, scanned_at DESC)
);

-- Table: seo_issues
-- Stores individual SEO issues found during scans
CREATE TABLE IF NOT EXISTS seo_issues (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Issue details
    category VARCHAR(100) NOT NULL, -- 'title', 'meta', 'images', 'schema', 'links', 'performance', 'content'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'warning', 'info', 'passed'
    title TEXT NOT NULL,
    description TEXT,
    
    -- Current state
    current_value TEXT,
    element_selector TEXT, -- CSS selector for the element
    element_html TEXT, -- HTML of the problematic element
    
    -- Fix status
    fix_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'fixed', 'ignored', 'auto_fixed'
    fixed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_scan_issues (scan_id),
    INDEX idx_user_issues (user_id, fix_status),
    INDEX idx_severity (severity)
);

-- Table: seo_fixes
-- Stores AI-generated fixes for SEO issues
CREATE TABLE IF NOT EXISTS seo_fixes (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES seo_issues(id) ON DELETE CASCADE,
    scan_id INTEGER REFERENCES seo_scans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Fix details
    fix_type VARCHAR(100) NOT NULL, -- 'title_tag', 'meta_description', 'alt_text', 'schema', 'internal_link'
    
    -- Original vs Optimized
    original_content TEXT,
    optimized_content TEXT NOT NULL,
    
    -- AI generation details
    ai_model VARCHAR(100), -- 'gpt-4', 'claude-3', etc.
    ai_prompt TEXT,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Application status
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP,
    applied_method VARCHAR(50), -- 'manual', 'one_click', 'auto'
    
    -- Metadata
    keywords_used TEXT[], -- Array of keywords used in optimization
    character_count INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_issue_fixes (issue_id),
    INDEX idx_user_fixes (user_id, applied),
    INDEX idx_scan_fixes (scan_id)
);

-- Table: seo_monitoring
-- Tracks SEO metrics over time for monitoring
CREATE TABLE IF NOT EXISTS seo_monitoring (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    
    -- Metrics snapshot
    seo_score INTEGER,
    total_issues INTEGER,
    critical_issues INTEGER,
    warnings INTEGER,
    
    -- Specific metrics
    title_optimized BOOLEAN DEFAULT FALSE,
    meta_optimized BOOLEAN DEFAULT FALSE,
    images_optimized INTEGER DEFAULT 0,
    schema_present BOOLEAN DEFAULT FALSE,
    internal_links_count INTEGER DEFAULT 0,
    
    -- Performance
    page_load_time_ms INTEGER,
    page_size_kb INTEGER,
    
    -- Rankings (if tracked)
    avg_keyword_position DECIMAL(5,2),
    
    measured_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_url_monitoring (url, measured_at DESC),
    INDEX idx_user_monitoring (user_id, measured_at DESC)
);

-- Table: seo_schedules
-- Manages automated SEO scan schedules
CREATE TABLE IF NOT EXISTS seo_schedules (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    
    -- Schedule configuration
    frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
    day_of_week INTEGER, -- 0-6 for weekly
    day_of_month INTEGER, -- 1-31 for monthly
    time_of_day TIME, -- HH:MM
    
    -- Auto-fix settings
    auto_fix_enabled BOOLEAN DEFAULT FALSE,
    auto_fix_categories TEXT[], -- ['title', 'meta', 'alt_text', 'schema']
    
    -- Alert settings
    email_alerts BOOLEAN DEFAULT TRUE,
    alert_on_new_issues BOOLEAN DEFAULT TRUE,
    alert_on_score_drop BOOLEAN DEFAULT TRUE,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_schedules (user_id, active),
    INDEX idx_next_run (next_run_at, active)
);

-- Table: seo_reports
-- Stores generated SEO reports
CREATE TABLE IF NOT EXISTS seo_reports (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    url TEXT,
    domain TEXT,
    
    -- Report details
    report_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'on_demand'
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    
    -- Summary data (JSON)
    summary_data JSONB,
    
    -- Report file
    report_url TEXT, -- URL to PDF/HTML report
    
    -- Email status
    emailed BOOLEAN DEFAULT FALSE,
    emailed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_reports (user_id, created_at DESC),
    INDEX idx_report_type (report_type, created_at DESC)
);

-- Table: seo_keywords_tracked
-- Extended keyword tracking with SEO context
CREATE TABLE IF NOT EXISTS seo_keywords_tracked (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    keyword TEXT NOT NULL,
    domain TEXT NOT NULL,
    target_url TEXT, -- Specific page targeting this keyword
    
    -- Current ranking
    current_position INTEGER,
    previous_position INTEGER,
    best_position INTEGER,
    
    -- Search data
    search_volume INTEGER,
    competition VARCHAR(50), -- 'low', 'medium', 'high'
    cpc DECIMAL(10,2),
    
    -- Optimization status
    optimized_for_keyword BOOLEAN DEFAULT FALSE,
    last_optimized_at TIMESTAMP,
    
    -- Tracking
    location VARCHAR(100) DEFAULT 'United States',
    last_checked TIMESTAMP,
    check_frequency VARCHAR(50) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_keywords (user_id),
    INDEX idx_domain_keywords (domain),
    INDEX idx_keyword_position (keyword, current_position)
);

-- Create a view for dashboard summary
CREATE OR REPLACE VIEW seo_dashboard_summary AS
SELECT 
    user_id,
    COUNT(DISTINCT domain) as total_domains,
    COUNT(DISTINCT url) as total_pages_scanned,
    SUM(critical_issues) as total_critical_issues,
    SUM(warnings) as total_warnings,
    AVG(seo_score) as avg_seo_score,
    MAX(scanned_at) as last_scan_date
FROM seo_scans
WHERE scanned_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Comments
COMMENT ON TABLE seo_scans IS 'Stores SEO scan results for pages';
COMMENT ON TABLE seo_issues IS 'Individual SEO issues detected during scans';
COMMENT ON TABLE seo_fixes IS 'AI-generated fixes for SEO issues';
COMMENT ON TABLE seo_monitoring IS 'Historical SEO metrics for tracking improvements';
COMMENT ON TABLE seo_schedules IS 'Automated scan schedules and configurations';
COMMENT ON TABLE seo_reports IS 'Generated SEO reports (weekly/monthly)';
COMMENT ON TABLE seo_keywords_tracked IS 'Keywords being tracked for SEO performance';
