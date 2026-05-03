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

-- Sample data removed - manage through application

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
