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

INSERT INTO property_reviews (
  property_id, booking_id, guest_id, host_id, rating, comment,
  cleanliness, accuracy, communication, location, check_in, value,
  created_at, updated_at
)
VALUES
  (1, 3, 5, 3, 5, 'Amazing apartment with stunning views! John was a fantastic host and very responsive. The location is perfect for exploring downtown. Highly recommended!', 5, 5, 5, 5, 5, 4, '2024-02-16T10:00:00.000Z'::timestamp, '2024-02-16T10:00:00.000Z'::timestamp),
  (2, 1, 5, 3, 5, 'The beach house exceeded all expectations! Waking up to ocean views every morning was incredible. The house was spotless and had everything we needed.', 5, 5, 5, 5, 5, 5, '2024-03-26T14:30:00.000Z'::timestamp, '2024-03-26T14:30:00.000Z'::timestamp),
  (3, 4, 5, 3, 4, 'Great mountain retreat! The cabin was cozy and the fireplace was perfect for cold evenings. Only minor issue was the WiFi was a bit slow, but that added to the disconnect from city life.', 4, 4, 5, 5, 4, 4, '2024-05-06T16:45:00.000Z'::timestamp, '2024-05-06T16:45:00.000Z'::timestamp)
ON CONFLICT DO NOTHING;

INSERT INTO host_reviews (host_id, guest_id, booking_id, rating, comment, created_at)
VALUES
  (3, 5, 3, 5, 'John is an exceptional host! Very welcoming, provided great local recommendations, and was always available when needed.', '2024-02-16T10:05:00.000Z'::timestamp),
  (3, 5, 1, 5, 'Outstanding hospitality! John went above and beyond to ensure our stay was perfect.', '2024-03-26T14:35:00.000Z'::timestamp)
ON CONFLICT DO NOTHING;
