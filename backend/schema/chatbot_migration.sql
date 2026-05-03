-- Migration script to unify chatbot schema
-- This migrates data from chatbot_messages to chat_sessions and chat_messages

-- Step 1: Create chat_sessions from existing chatbot_messages
INSERT INTO chat_sessions (session_id, user_id, started_at, ended_at, message_count, resolved)
SELECT 
  session_id,
  user_id,
  MIN(created_at) as started_at,
  MAX(created_at) as ended_at,
  COUNT(*) as message_count,
  false as resolved
FROM chatbot_messages
WHERE session_id IS NOT NULL
GROUP BY session_id, user_id
ON CONFLICT (session_id) DO NOTHING;

-- Step 2: Migrate messages from chatbot_messages to chat_messages
INSERT INTO chat_messages (session_id, sender, message, created_at)
SELECT 
  session_id,
  CASE 
    WHEN sender = 'assistant' THEN 'bot'
    ELSE sender
  END as sender,
  message,
  created_at
FROM chatbot_messages
WHERE session_id IS NOT NULL
ORDER BY created_at ASC
ON CONFLICT DO NOTHING;

-- Step 3: Update message counts in chat_sessions
UPDATE chat_sessions cs
SET message_count = (
  SELECT COUNT(*) 
  FROM chat_messages cm 
  WHERE cm.session_id = cs.session_id
);

-- Step 4: Mark sessions as resolved if last message was from bot and no response after
UPDATE chat_sessions cs
SET resolved = true
WHERE EXISTS (
  SELECT 1 
  FROM chat_messages cm
  WHERE cm.session_id = cs.session_id
  AND cm.sender = 'bot'
  AND cm.created_at = (
    SELECT MAX(created_at) 
    FROM chat_messages 
    WHERE session_id = cs.session_id
  )
  AND cs.ended_at < NOW() - INTERVAL '30 minutes'
);

-- Step 5: Add new columns to chat_sessions for enhanced tracking
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS feedback VARCHAR(20) CHECK (feedback IN ('positive', 'negative', 'none')),
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS admin_joined BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- Step 6: Set default feedback to 'none' for existing sessions
UPDATE chat_sessions SET feedback = 'none' WHERE feedback IS NULL;

-- Step 7: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_escalated ON chat_sessions(escalated);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_resolved ON chat_sessions(resolved);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_sender ON chat_messages(session_id, sender);

-- Step 8: Verify migration
DO $$
DECLARE
  old_count INTEGER;
  new_count INTEGER;
  session_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM chatbot_messages;
  SELECT COUNT(*) INTO new_count FROM chat_messages;
  SELECT COUNT(*) INTO session_count FROM chat_sessions;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Old messages (chatbot_messages): %', old_count;
  RAISE NOTICE '  New messages (chat_messages): %', new_count;
  RAISE NOTICE '  Sessions created: %', session_count;
  
  IF new_count < old_count THEN
    RAISE WARNING 'Some messages may not have been migrated. Please verify.';
  END IF;
END $$;

-- Step 9: Rename old table (don't drop yet, keep as backup)
ALTER TABLE IF EXISTS chatbot_messages RENAME TO chatbot_messages_backup;

RAISE NOTICE 'Migration completed successfully!';
RAISE NOTICE 'Old table renamed to chatbot_messages_backup for safety.';
RAISE NOTICE 'After verifying data integrity, you can drop it with: DROP TABLE chatbot_messages_backup;';
