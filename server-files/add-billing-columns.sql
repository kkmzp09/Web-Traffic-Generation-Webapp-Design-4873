-- Add missing billing columns to subscriptions table

-- Add next_billing_date if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'next_billing_date'
    ) THEN
        ALTER TABLE subscriptions 
        ADD COLUMN next_billing_date TIMESTAMP;
        
        -- Set default value for existing rows
        UPDATE subscriptions 
        SET next_billing_date = created_at + INTERVAL '1 month'
        WHERE next_billing_date IS NULL;
        
        RAISE NOTICE 'Added next_billing_date column';
    END IF;
END $$;

-- Add start_date if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE subscriptions 
        ADD COLUMN start_date TIMESTAMP DEFAULT NOW();
        
        -- Set default value for existing rows
        UPDATE subscriptions 
        SET start_date = created_at
        WHERE start_date IS NULL;
        
        RAISE NOTICE 'Added start_date column';
    END IF;
END $$;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
