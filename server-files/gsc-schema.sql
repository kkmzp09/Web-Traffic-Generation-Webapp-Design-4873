-- Google Search Console Integration Schema
-- Creates tables for storing GSC connections and search analytics data

-- GSC connections table
CREATE TABLE IF NOT EXISTS gsc_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_url TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, site_url)
);

-- GSC search analytics data
CREATE TABLE IF NOT EXISTS gsc_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES gsc_connections(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  page_url TEXT,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4),
  position DECIMAL(5,2),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(connection_id, query, page_url, date)
);

-- GSC top keywords cache (for faster access)
CREATE TABLE IF NOT EXISTS gsc_top_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES gsc_connections(id) ON DELETE CASCADE,
  page_url TEXT,
  keyword TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4),
  position DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(connection_id, page_url, keyword)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gsc_connections_user ON gsc_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_gsc_analytics_connection ON gsc_search_analytics(connection_id);
CREATE INDEX IF NOT EXISTS idx_gsc_analytics_query ON gsc_search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_gsc_analytics_page ON gsc_search_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_gsc_analytics_date ON gsc_search_analytics(date);
CREATE INDEX IF NOT EXISTS idx_gsc_top_keywords_connection ON gsc_top_keywords(connection_id);
CREATE INDEX IF NOT EXISTS idx_gsc_top_keywords_page ON gsc_top_keywords(page_url);

-- Success message
SELECT 'GSC tables created successfully!' as status;
