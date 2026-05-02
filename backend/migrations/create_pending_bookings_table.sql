-- Create pending_bookings table for temporary storage before payment
CREATE TABLE IF NOT EXISTS pending_bookings (
  id SERIAL PRIMARY KEY,
  pending_id VARCHAR(100) UNIQUE NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_bookings_pending_id ON pending_bookings(pending_id);
CREATE INDEX IF NOT EXISTS idx_pending_bookings_expires_at ON pending_bookings(expires_at);

-- Auto-delete expired pending bookings (optional cleanup)
CREATE OR REPLACE FUNCTION delete_expired_pending_bookings()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_bookings WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
