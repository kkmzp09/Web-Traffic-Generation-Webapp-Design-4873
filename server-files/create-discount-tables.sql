-- Create discount codes tables

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  expires_at TIMESTAMP,
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  allow_multiple_uses BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Discount code usage tracking
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id SERIAL PRIMARY KEY,
  discount_code_id INTEGER REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(active);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user ON discount_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_code_usage(discount_code_id);

-- Insert testing discount code (100% off for unlimited uses)
INSERT INTO discount_codes (code, discount_type, discount_value, description, allow_multiple_uses, active)
VALUES ('TESTING100', 'percentage', 100, 'Testing discount - 100% off for development', true, true)
ON CONFLICT (code) DO NOTHING;

-- Insert other useful discount codes
INSERT INTO discount_codes (code, discount_type, discount_value, description, max_uses, active)
VALUES 
  ('LAUNCH50', 'percentage', 50, 'Launch special - 50% off first month', 100, true),
  ('SAVE20', 'percentage', 20, 'Save 20% on any plan', NULL, true),
  ('EARLYBIRD', 'percentage', 30, 'Early bird special - 30% off', 50, true)
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE discount_codes IS 'Discount codes for promotions and testing';
COMMENT ON TABLE discount_code_usage IS 'Tracks discount code usage by users';
