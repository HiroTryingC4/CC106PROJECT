# Email Verification Troubleshooting Guide

## Problem: "Verification Failed - Invalid verification token"

### Possible Causes & Solutions

### 1. **Database Migration Not Run**

The email verification columns might not exist in your database yet.

**Solution:**
Run the migration script:

```bash
cd backend
node scripts/run_email_verification_migration.js
```

Or manually run the SQL:
```sql
-- Add email verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users (verification_token);

-- Update existing users to have verified emails (backward compatibility)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
```

### 2. **Email Service Not Configured**

Check if your `.env` file has email configuration:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Frontend URL for verification links
FRONTEND_URL=http://localhost:3000
```

**For Gmail:**
- Use an App Password, not your regular password
- Enable 2-Factor Authentication
- Generate App Password at: https://myaccount.google.com/apppasswords

### 3. **Old User Account (Created Before Email Verification)**

If you registered before email verification was added, your account doesn't have a verification token.

**Solution:**
Manually verify your account in the database:

```sql
UPDATE users 
SET email_verified = TRUE 
WHERE email = 'your-email@example.com';
```

Or use the resend verification feature on the login page.

### 4. **Token Expired (24 hours)**

Verification tokens expire after 24 hours.

**Solution:**
- Go to the login page
- Click "Resend Verification Email"
- Enter your email address
- Check your inbox for a new verification link

### 5. **Token Not in URL**

The verification link should look like:
```
http://localhost:3000/verify-email?token=abc123...
```

If the URL doesn't have `?token=...`, the link is broken.

**Solution:**
Request a new verification email.

### 6. **Check Database Directly**

Verify the token exists in your database:

```sql
-- Check if user has a verification token
SELECT 
  id, 
  email, 
  email_verified, 
  verification_token IS NOT NULL as has_token,
  verification_token_expires,
  CASE 
    WHEN verification_token_expires > NOW() THEN 'Valid'
    WHEN verification_token_expires < NOW() THEN 'Expired'
    ELSE 'No expiry set'
  END as token_status
FROM users 
WHERE email = 'your-email@example.com';
```

## Testing Email Verification

### 1. Register a New Account
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "SecurePass123!",
  "role": "guest"
}
```

### 2. Check Console Logs
The backend should log:
```
Token update result: 1 rows updated for user <userId>
Verification email sent successfully to: test@example.com
```

### 3. Check Email
- Look in your inbox for the verification email
- Check spam/junk folder
- The email should have a "Verify Email Address" button

### 4. Click Verification Link
The link should redirect to `/verify-email?token=...`

### 5. Verify Success
You should see:
- ✅ "Email Verified!" message
- Automatic redirect to login page after 3 seconds

## Manual Verification (Development Only)

If email isn't working in development, manually verify users:

```sql
-- Verify specific user
UPDATE users 
SET email_verified = TRUE,
    verification_token = NULL,
    verification_token_expires = NULL
WHERE email = 'test@example.com';

-- Verify all users (for testing)
UPDATE users 
SET email_verified = TRUE,
    verification_token = NULL,
    verification_token_expires = NULL;
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid verification token" | Token not found in database | Request new verification email |
| "Verification token has expired" | Token older than 24 hours | Request new verification email |
| "Email already verified" | Account already verified | Go to login page |
| "Please verify your email before logging in" | Trying to login without verification | Check email for verification link |

## Environment Variables Checklist

Make sure these are set in your `.env` file:

```env
# Required for email verification
✓ SMTP_HOST
✓ SMTP_PORT
✓ SMTP_USER
✓ SMTP_PASS
✓ FRONTEND_URL

# Optional
- SMTP_SECURE (default: false)
- SMTP_FROM (defaults to SMTP_USER)
```

## Still Having Issues?

1. **Check backend logs** for error messages
2. **Check browser console** for network errors
3. **Verify database connection** is working
4. **Test email service** with a simple test script
5. **Check firewall/antivirus** isn't blocking SMTP

## Disable Email Verification (Development Only)

If you want to disable email verification temporarily:

In `backend/routes/auth.js`, comment out the email verification check in the login route:

```javascript
// Comment out these lines:
/*
if (verificationCheck.rows.length > 0 && verificationCheck.rows[0].email_verified === false) {
  return res.status(403).json({ 
    message: 'Please verify your email before logging in.',
    emailNotVerified: true,
    email: user.email
  });
}
*/
```

**⚠️ WARNING:** Only do this in development. Always require email verification in production!
