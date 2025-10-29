-- Keyword Tracker Schema for Neon PostgreSQL
-- Tracks keyword rankings, search volume, and historical data

-- Main tracked keywords table
CREATE TABLE IF NOT EXISTS tracked_keywords (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  keyword VARCHAR(500) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  location_code INTEGER DEFAULT 2840, -- US by default (DataForSEO location code)
  location_name VARCHAR(100) DEFAULT 'United States',
  language_code VARCHAR(10) DEFAULT 'en',
  
  -- Current metrics
  current_rank INTEGER,
  search_volume INTEGER,
  competition DECIMAL(3,2), -- 0.00 to 1.00
  cpc DECIMAL(10,2), -- Cost per click
  
  -- Historical tracking
  previous_rank INTEGER,
  best_rank INTEGER,
  worst_rank INTEGER,
  
  -- DataForSEO task IDs
  serp_task_id VARCHAR(100),
  keyword_task_id VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, paused, failed
  last_checked TIMESTAMP,
  next_check TIMESTAMP,
  check_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_user_keyword_domain UNIQUE(user_id, keyword, domain)
);

-- Keyword ranking history table
CREATE TABLE IF NOT EXISTS keyword_ranking_history (
  id SERIAL PRIMARY KEY,
  keyword_id INTEGER REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  rank_position INTEGER,
  search_volume INTEGER,
  cpc DECIMAL(10,2),
  competition DECIMAL(3,2),
  url VARCHAR(1000), -- The URL that ranked
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Keyword metrics snapshot (from Keywords Data API)
CREATE TABLE IF NOT EXISTS keyword_metrics (
  id SERIAL PRIMARY KEY,
  keyword_id INTEGER REFERENCES tracked_keywords(id) ON DELETE CASCADE,
  
  -- Search metrics
  search_volume INTEGER,
  monthly_searches JSONB, -- Array of monthly search volumes
  
  -- Competition metrics
  competition DECIMAL(3,2),
  competition_level VARCHAR(20), -- LOW, MEDIUM, HIGH
  cpc DECIMAL(10,2),
  
  -- Trend data
  trend JSONB, -- Trend data over time
  
  -- Related keywords
  related_keywords JSONB,
  
  -- Timestamps
  fetched_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_user ON tracked_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_status ON tracked_keywords(status);
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_next_check ON tracked_keywords(next_check);
CREATE INDEX IF NOT EXISTS idx_ranking_history_keyword ON keyword_ranking_history(keyword_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tracked_keywords_updated_at BEFORE UPDATE
    ON tracked_keywords FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
