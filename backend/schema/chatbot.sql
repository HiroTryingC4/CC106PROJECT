CREATE TABLE IF NOT EXISTS chatbot_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(120) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chatbot_messages_sender_check CHECK (sender IN ('user', 'assistant'))
);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session_id ON chatbot_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_user_id ON chatbot_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at DESC);