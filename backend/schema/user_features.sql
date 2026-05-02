CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL DEFAULT '',
  profile_picture TEXT NOT NULL DEFAULT '',
  preferences JSONB NOT NULL DEFAULT '{"notifications":true,"emailUpdates":true,"smsAlerts":false}'::jsonb,
  host_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  guest_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

INSERT INTO user_profiles (user_id, bio, profile_picture, preferences, host_info, guest_info)
VALUES
  (1, 'Platform administrator ensuring smooth operations.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '{"notifications":true,"emailUpdates":true,"smsAlerts":false}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  (2, 'Managing communications and customer support.', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', '{"notifications":true,"emailUpdates":true,"smsAlerts":true}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  (3, 'Experienced host with 5 years in hospitality. I love sharing my beautiful properties with travelers from around the world.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '{"notifications":true,"emailUpdates":true,"smsAlerts":true}'::jsonb, '{"yearsHosting":5,"responseRate":95,"responseTime":"1 hour","languages":["English","Spanish"],"verificationBadges":["Email","Phone","ID","Business License"]}'::jsonb, '{}'::jsonb),
  (4, 'New to hosting but excited to welcome guests!', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '{"notifications":true,"emailUpdates":true,"smsAlerts":false}'::jsonb, '{}'::jsonb, '{}'::jsonb),
  (5, 'Travel enthusiast who loves exploring new places and meeting new people.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', '{"notifications":true,"emailUpdates":false,"smsAlerts":true}'::jsonb, '{}'::jsonb, '{"memberSince":"2024-02-01","tripsCompleted":12,"reviewsReceived":8,"averageRating":4.9}'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
VALUES
  (3, 'booking_confirmed', 'New Booking Confirmed', 'Jane Guest has booked your Downtown Apartment for March 20-25.', false, '2024-03-10T10:00:00.000Z'::timestamp),
  (3, 'payment_received', 'Payment Received', 'You''ve received $727.50 for booking #1234.', true, '2024-03-10T10:05:00.000Z'::timestamp),
  (5, 'booking_reminder', 'Upcoming Trip Reminder', 'Your stay at Downtown Apartment starts in 3 days!', false, '2024-03-17T09:00:00.000Z'::timestamp),
  (3, 'review_received', 'New Review Received', 'Jane Guest left you a 5-star review!', false, '2024-02-16T10:00:00.000Z'::timestamp)
ON CONFLICT DO NOTHING;
