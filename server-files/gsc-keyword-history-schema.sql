-- GSC Keyword History Schema
-- Tracks keyword performance over time

CREATE TABLE IF NOT EXISTS public.gsc_keyword_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.gsc_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  site_url TEXT NOT NULL,
  page_url TEXT,
  keyword TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_keyword_history_connection ON public.gsc_keyword_history(connection_id);
CREATE INDEX IF NOT EXISTS idx_keyword_history_user ON public.gsc_keyword_history(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_history_keyword ON public.gsc_keyword_history(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_history_date ON public.gsc_keyword_history(date);
CREATE INDEX IF NOT EXISTS idx_keyword_history_page ON public.gsc_keyword_history(page_url);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_keyword_history_lookup 
  ON public.gsc_keyword_history(user_id, site_url, keyword, date DESC);

-- Success message
SELECT 'GSC keyword history table created successfully!' as status;
