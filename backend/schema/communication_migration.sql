-- First, check if messages table needs to be modified
-- Add missing columns to messages table if they don't exist

DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='user_id') THEN
        ALTER TABLE messages ADD COLUMN user_id INTEGER;
        ALTER TABLE messages ADD CONSTRAINT fk_messages_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Add subject column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='subject') THEN
        ALTER TABLE messages ADD COLUMN subject VARCHAR(255);
    END IF;

    -- Add message column if it doesn't exist (might be named 'content' or similar)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='message') THEN
        -- Check if there's a 'content' column we can rename
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='content') THEN
            ALTER TABLE messages RENAME COLUMN content TO message;
        ELSE
            ALTER TABLE messages ADD COLUMN message TEXT;
        END IF;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='status') THEN
        ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'unread';
        ALTER TABLE messages ADD CONSTRAINT chk_messages_status 
            CHECK (status IN ('unread', 'read', 'sent', 'flagged'));
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='priority') THEN
        ALTER TABLE messages ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
        ALTER TABLE messages ADD CONSTRAINT chk_messages_priority 
            CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
    END IF;

    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='category') THEN
        ALTER TABLE messages ADD COLUMN category VARCHAR(50) DEFAULT 'general';
        ALTER TABLE messages ADD CONSTRAINT chk_messages_category 
            CHECK (category IN ('booking', 'payment', 'communication', 'amenities', 'feedback', 'complaint', 'property', 'general'));
    END IF;

    -- Add replied_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='replied_at') THEN
        ALTER TABLE messages ADD COLUMN replied_at TIMESTAMP NULL;
    END IF;

    -- Add replied_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='replied_by') THEN
        ALTER TABLE messages ADD COLUMN replied_by INTEGER NULL;
        ALTER TABLE messages ADD CONSTRAINT fk_messages_replied_by 
            FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;

    -- Add reply_message column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='reply_message') THEN
        ALTER TABLE messages ADD COLUMN reply_message TEXT NULL;
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='messages' AND column_name='updated_at') THEN
        ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Chatbot settings table
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT TRUE,
  welcome_message TEXT,
  fallback_message TEXT,
  response_delay INTEGER DEFAULT 3000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default chatbot settings
INSERT INTO chatbot_settings (id, enabled, welcome_message, fallback_message, response_delay)
VALUES (1, TRUE, 'Hello! I''m your smart assistant. How can I help you today?', 'I''m not sure I understand that. Could you rephrase that?', 3000)
ON CONFLICT (id) DO NOTHING;

-- Chat sessions table (for chatbot analytics)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id INTEGER NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  message_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);

-- Chat messages table (for chatbot conversation history)
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
