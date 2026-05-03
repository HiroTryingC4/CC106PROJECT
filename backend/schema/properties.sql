CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  address JSONB NOT NULL DEFAULT '{}',
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability BOOLEAN DEFAULT true,
  rating DECIMAL(3, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  time_availability JSONB DEFAULT '{"checkInTime": "15:00", "checkOutTime": "11:00"}',
  payment_methods JSONB DEFAULT '{"cash": true, "gcash": false, "paymaya": false, "bankTransfer": false}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties (host_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (type);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON properties (availability);

-- Sample properties removed - manage through application
