CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  payer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) DEFAULT '',
  reference_number VARCHAR(255) DEFAULT '',
  processing_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  host_payout DECIMAL(12, 2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  CONSTRAINT payments_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_user_id ON payments(payer_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_host_id ON payments(host_id);

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
  ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS processing_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS host_payout DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'metadata'
      AND data_type = 'json'
  ) THEN
    ALTER TABLE payments
      ALTER COLUMN metadata TYPE JSONB
      USING metadata::jsonb;
  END IF;
END
$$;

UPDATE payments
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;
