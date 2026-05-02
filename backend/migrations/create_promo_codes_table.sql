-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL CHECK (value > 0),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_limit INTEGER NOT NULL CHECK (usage_limit > 0),
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  min_booking_amount DECIMAL(10, 2) DEFAULT 0 CHECK (min_booking_amount >= 0),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(host_id, code),
  CHECK (end_date >= start_date),
  CHECK (used_count <= usage_limit)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_host_id ON promo_codes(host_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes(status);

-- Add comment
COMMENT ON TABLE promo_codes IS 'Stores promotional discount codes created by hosts';
