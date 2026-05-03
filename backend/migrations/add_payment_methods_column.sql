-- Add payment_methods column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{"cash": true, "gcash": false, "paymaya": false, "bankTransfer": false}'::jsonb;

-- Update existing properties to have default payment methods if null
UPDATE properties 
SET payment_methods = '{"cash": true, "gcash": false, "paymaya": false, "bankTransfer": false}'::jsonb
WHERE payment_methods IS NULL;
