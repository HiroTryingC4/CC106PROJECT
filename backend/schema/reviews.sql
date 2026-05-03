CREATE TABLE IF NOT EXISTS property_reviews (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id INTEGER,
  guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  cleanliness INTEGER NOT NULL DEFAULT 0 CHECK (cleanliness BETWEEN 0 AND 5),
  accuracy INTEGER NOT NULL DEFAULT 0 CHECK (accuracy BETWEEN 0 AND 5),
  communication INTEGER NOT NULL DEFAULT 0 CHECK (communication BETWEEN 0 AND 5),
  location INTEGER NOT NULL DEFAULT 0 CHECK (location BETWEEN 0 AND 5),
  check_in INTEGER NOT NULL DEFAULT 0 CHECK (check_in BETWEEN 0 AND 5),
  value INTEGER NOT NULL DEFAULT 0 CHECK (value BETWEEN 0 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS host_reviews (
  id SERIAL PRIMARY KEY,
  host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_host_id ON property_reviews(host_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_guest_id ON property_reviews(guest_id);
CREATE INDEX IF NOT EXISTS idx_host_reviews_host_id ON host_reviews(host_id);

-- Sample reviews removed - manage through application
