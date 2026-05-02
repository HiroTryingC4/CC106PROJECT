CREATE TABLE IF NOT EXISTS admin_notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,
  actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  ip_address VARCHAR(100) DEFAULT '',
  user_agent TEXT DEFAULT '',
  target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  target_property_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY,
  settings JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT system_settings_singleton CHECK (id = 1)
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_logs(created_at DESC);

INSERT INTO admin_notifications (type, title, message, target_user_id, priority, is_read, created_at)
VALUES
  ('host_verification', 'New Host Verification Pending', 'Sarah NewHost has submitted verification documents for review.', 4, 'high', false, '2024-03-15T10:30:00.000Z'::timestamp),
  ('payment_issue', 'Payment Processing Delay', 'Booking #1234 payment is experiencing processing delays.', NULL, 'medium', false, '2024-03-14T16:20:00.000Z'::timestamp),
  ('review_flagged', 'Review Flagged for Moderation', 'A review for Property #567 has been flagged by the host.', NULL, 'low', true, '2024-03-13T09:15:00.000Z'::timestamp)
ON CONFLICT DO NOTHING;

INSERT INTO admin_activity_logs (actor_user_id, action, description, ip_address, user_agent, target_user_id, target_property_id, created_at)
VALUES
  (1, 'user_login', 'Admin user logged in', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NULL, NULL, '2024-03-16T08:00:00.000Z'::timestamp),
  (1, 'host_verification_approved', 'Approved host verification for John Host', '', '', 3, NULL, '2024-03-15T14:30:00.000Z'::timestamp),
  (2, 'property_suspended', 'Suspended property #789 due to policy violation', '', '', NULL, 789, '2024-03-14T11:45:00.000Z'::timestamp),
  (1, 'user_banned', 'Banned user for violating terms of service', '', '', NULL, NULL, '2024-03-13T16:20:00.000Z'::timestamp)
ON CONFLICT DO NOTHING;

INSERT INTO system_settings (id, settings, updated_at)
VALUES (
  1,
  '{
    "platform": {
      "maintenanceMode": false,
      "registrationEnabled": true,
      "bookingEnabled": true,
      "paymentProcessing": true
    },
    "fees": {
      "hostCommission": 3.0,
      "guestServiceFee": 5.0,
      "paymentProcessingFee": 2.9
    },
    "limits": {
      "maxPropertiesPerHost": 10,
      "maxGuestsPerBooking": 16,
      "maxBookingDuration": 30,
      "minBookingDuration": 1
    },
    "security": {
      "passwordMinLength": 8,
      "sessionTimeout": 24,
      "maxLoginAttempts": 5,
      "twoFactorRequired": false
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
