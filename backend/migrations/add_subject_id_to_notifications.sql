-- Add subject_id column to user_notifications table
ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS subject_id INTEGER;

-- Add subject_id column to admin_notifications table
ALTER TABLE admin_notifications 
ADD COLUMN IF NOT EXISTS subject_id INTEGER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_subject_id ON user_notifications(subject_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_subject_id ON admin_notifications(subject_id);
