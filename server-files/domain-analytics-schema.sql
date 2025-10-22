-- Domain Analytics History Schema
-- Stores domain analysis results for historical tracking

CREATE TABLE IF NOT EXISTS domain_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    
    -- Overview metrics
    total_keywords INTEGER DEFAULT 0,
    organic_traffic BIGINT DEFAULT 0,
    organic_cost DECIMAL(12, 2) DEFAULT 0,
    visibility_score INTEGER DEFAULT 0,
    
    -- Top keywords (JSON array)
    top_keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Competitors (JSON array)
    competitors JSONB DEFAULT '[]'::jsonb,
    
    -- Backlinks data (JSON object)
    backlinks JSONB DEFAULT '{}'::jsonb,
    
    -- Full raw response (for future reference)
    raw_data JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    location VARCHAR(100) DEFAULT 'United States',
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for faster queries
    CONSTRAINT unique_user_domain_analysis UNIQUE (user_id, domain, analyzed_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_domain_analytics_user_id ON domain_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_analytics_domain ON domain_analytics(domain);
CREATE INDEX IF NOT EXISTS idx_domain_analytics_analyzed_at ON domain_analytics(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_analytics_user_domain ON domain_analytics(user_id, domain);

-- Create view for latest analyses per domain
CREATE OR REPLACE VIEW latest_domain_analytics AS
SELECT DISTINCT ON (user_id, domain) *
FROM domain_analytics
ORDER BY user_id, domain, analyzed_at DESC;

COMMENT ON TABLE domain_analytics IS 'Stores historical domain SEO analytics data';
COMMENT ON COLUMN domain_analytics.top_keywords IS 'Array of top ranking keywords with positions, volume, etc.';
COMMENT ON COLUMN domain_analytics.competitors IS 'Array of competitor domains with metrics';
COMMENT ON COLUMN domain_analytics.backlinks IS 'Backlink profile data';
COMMENT ON COLUMN domain_analytics.raw_data IS 'Full DataForSEO API response for reference';
