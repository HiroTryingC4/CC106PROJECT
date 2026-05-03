-- Quick fix: Verify all users manually
UPDATE users SET email_verified = TRUE;

-- Verify specific user by email
-- UPDATE users SET email_verified = TRUE WHERE email = 'your-email@example.com';

-- Check results
SELECT id, email, email_verified FROM users ORDER BY id;
