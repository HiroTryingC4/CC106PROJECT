-- Communication Admin Settings table
CREATE TABLE IF NOT EXISTS communication_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_notifications BOOLEAN DEFAULT TRUE,
  message_alerts BOOLEAN DEFAULT TRUE,
  chatbot_alerts BOOLEAN DEFAULT FALSE,
  auto_response BOOLEAN DEFAULT TRUE,
  response_time_hours INTEGER DEFAULT 2,
  max_concurrent_chats INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT communication_settings_single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO communication_settings (id, email_notifications, message_alerts, chatbot_alerts, auto_response, response_time_hours, max_concurrent_chats)
VALUES (1, TRUE, TRUE, FALSE, TRUE, 2, 10)
ON CONFLICT (id) DO NOTHING;

-- System Status table
CREATE TABLE IF NOT EXISTS system_status (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system statuses
INSERT INTO system_status (service_name, status) VALUES
  ('message_system', 'online'),
  ('chatbot_service', 'online'),
  ('notification_service', 'online')
ON CONFLICT (service_name) DO NOTHING;
