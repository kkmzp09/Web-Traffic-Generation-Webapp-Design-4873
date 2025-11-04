-- Update payments table to support guest users

-- Make user_id nullable (allow guest payments)
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;

-- Add guest user information columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_payments_guest_email ON payments(guest_email);

COMMENT ON COLUMN payments.guest_email IS 'Email for guest users (non-registered)';
COMMENT ON COLUMN payments.guest_name IS 'Name for guest users (non-registered)';
