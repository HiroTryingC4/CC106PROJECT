# Quick Fix: "Verification Failed - Invalid verification token"

## 🚀 Quick Solutions (Try these first)

### Option 1: Run Diagnostic Script
```bash
cd backend
node scripts/check_email_verification.js
```

This will tell you exactly what's wrong.

### Option 2: Run Migration (if columns are missing)
```bash
cd backend
node scripts/run_email_verification_migration.js
```

### Option 3: Manually Verify Your Account (Development Only)
```sql
-- Connect to your database and run:
UPDATE users 
SET email_verified = TRUE 
WHERE email = 'your-email@example.com';
```

### Option 4: Request New Verification Email
1. Go to login page
2. Try to login (you'll get an error)
3. Click "Resend Verification Email"
4. Enter your email
5. Check your inbox

## 📋 Step-by-Step Troubleshooting

### Step 1: Check if Migration Ran
```bash
cd backend
node scripts/check_email_verification.js
```

Look for: "✅ All email verification columns exist"

If you see "❌ Missing columns", run:
```bash
node scripts/run_email_verification_migration.js
```

### Step 2: Check Email Configuration
Make sure your `.env` file has:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Step 3: Test with New Account
1. Register a new account
2. Check backend console for: "Verification email sent successfully"
3. Check your email inbox (and spam folder)
4. Click the verification link

### Step 4: If Still Not Working
Temporarily disable email verification (development only):

In `backend/routes/auth.js`, find the login route and comment out:
```javascript
// Lines ~150-157, comment out:
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

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid verification token" | Token doesn't exist - request new one |
| "Token expired" | Token older than 24 hours - request new one |
| "Email already verified" | You're good! Just login |
| No email received | Check spam, verify SMTP settings |
| Old account (before verification) | Manually set email_verified = TRUE |

## 📧 Gmail Setup (if using Gmail)

1. Enable 2-Factor Authentication
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password"
4. Use that password in SMTP_PASS (not your regular password)

## 🎯 For Development: Skip Email Verification

If you just want to test and don't care about email verification:

```sql
-- Verify all existing users
UPDATE users SET email_verified = TRUE;

-- Set default for new users
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT TRUE;
```

Then restart your backend server.

## 📞 Need More Help?

See the full troubleshooting guide:
`EMAIL_VERIFICATION_TROUBLESHOOTING.md`
