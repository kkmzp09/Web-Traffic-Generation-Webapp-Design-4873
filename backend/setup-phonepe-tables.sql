-- Create payments table for PhonePe transactions
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  merchant_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  phonepe_transaction_id VARCHAR(255),
  plan_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'phonepe',
  phonepe_response JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_transaction_id ON payments(merchant_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add payment_id to subscriptions table if not exists
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id);

COMMENT ON TABLE payments IS 'Stores PhonePe payment transactions';
COMMENT ON COLUMN payments.transaction_id IS 'Internal transaction ID';
COMMENT ON COLUMN payments.merchant_transaction_id IS 'PhonePe merchant transaction ID';
COMMENT ON COLUMN payments.phonepe_transaction_id IS 'PhonePe transaction ID from callback';
COMMENT ON COLUMN payments.phonepe_response IS 'Full PhonePe API response';
