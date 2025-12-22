-- Create table for storing auto-fix verification results
CREATE TABLE IF NOT EXISTS autofix_verifications (
  id SERIAL PRIMARY KEY,
  scan_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  verified_at TIMESTAMP NOT NULL DEFAULT NOW(),
  changes_detected JSONB,
  change_count INTEGER DEFAULT 0,
  before_state JSONB,
  after_state JSONB,
  widget_logs JSONB,
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_autofix_verifications_scan_id ON autofix_verifications(scan_id);
CREATE INDEX IF NOT EXISTS idx_autofix_verifications_url ON autofix_verifications(url);
CREATE INDEX IF NOT EXISTS idx_autofix_verifications_status ON autofix_verifications(verification_status);

-- Add comment
COMMENT ON TABLE autofix_verifications IS 'Stores server-side verification results for auto-fix applications';
