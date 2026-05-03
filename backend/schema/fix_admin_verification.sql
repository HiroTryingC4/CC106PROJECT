-- Update existing admin and comm-admin accounts to have email_verified = true
UPDATE users 
SET email_verified = true 
WHERE role IN ('admin', 'communication_admin');

-- Also update any existing verified hosts and guests
UPDATE users 
SET email_verified = true 
WHERE verification_status = 'verified';

-- Verify the changes
SELECT id, email, role, email_verified, verification_status 
FROM users 
WHERE role IN ('admin', 'communication_admin')
ORDER BY id;
