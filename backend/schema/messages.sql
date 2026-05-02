CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(120) NOT NULL,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER,
  booking_id INTEGER,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

INSERT INTO messages (
  conversation_id,
  sender_id,
  receiver_id,
  property_id,
  booking_id,
  message,
  is_read,
  created_at,
  updated_at
)
SELECT
  seed.conversation_id,
  seed.sender_id,
  seed.receiver_id,
  seed.property_id,
  seed.booking_id,
  seed.message,
  seed.is_read,
  seed.created_at,
  seed.updated_at
FROM (
  VALUES
    (
      'conv_b_1_3_5',
      5,
      3,
      1,
      1,
      'Hi John! I''m excited about my upcoming stay at your downtown apartment. Is early check-in possible?',
      true,
      '2024-03-15T10:30:00.000Z'::timestamp,
      '2024-03-15T10:30:00.000Z'::timestamp
    ),
    (
      'conv_b_1_3_5',
      3,
      5,
      1,
      1,
      'Hi Jane! Welcome! Yes, early check-in should be fine. I can have the apartment ready by 1 PM. Looking forward to hosting you!',
      true,
      '2024-03-15T11:15:00.000Z'::timestamp,
      '2024-03-15T11:15:00.000Z'::timestamp
    ),
    (
      'conv_b_1_3_5',
      5,
      3,
      1,
      1,
      'Perfect! Thank you so much. Also, could you recommend some good restaurants nearby?',
      true,
      '2024-03-15T11:45:00.000Z'::timestamp,
      '2024-03-15T11:45:00.000Z'::timestamp
    ),
    (
      'conv_b_1_3_5',
      3,
      5,
      1,
      1,
      'Absolutely! There''s a great Italian place called "Bella Vista" just 2 blocks away, and "The Local Bistro" has amazing brunch. I''ll send you a list with my welcome message!',
      false,
      '2024-03-15T12:20:00.000Z'::timestamp,
      '2024-03-15T12:20:00.000Z'::timestamp
    ),
    (
      'conv_u_1_3',
      1,
      3,
      NULL,
      NULL,
      'Congratulations! Your host verification has been approved. You now have access to all host features.',
      true,
      '2024-02-02T14:30:00.000Z'::timestamp,
      '2024-02-02T14:30:00.000Z'::timestamp
    )
) AS seed(
  conversation_id,
  sender_id,
  receiver_id,
  property_id,
  booking_id,
  message,
  is_read,
  created_at,
  updated_at
)
WHERE NOT EXISTS (SELECT 1 FROM messages LIMIT 1);