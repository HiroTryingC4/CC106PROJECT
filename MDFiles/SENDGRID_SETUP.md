# SendGrid Setup - Complete Guide

## ✅ What You Need to Do

### Step 1: Verify Single Sender (2 minutes)

1. **Go to SendGrid Dashboard**
   - https://app.sendgrid.com
   - Login with your account

2. **Navigate to Sender Authentication**
   - Left sidebar → Settings
   - Click "Sender Authentication"

3. **Click "Verify a Single Sender"**
   - Big blue button

4. **Fill in the Form**
   ```
   From Name: SmartStay Bookings
   From Email: your_email@gmail.com (use your real email)
   Reply To: your_email@gmail.com
   Company Address: Your address
   City: Your city
   Country: Philippines
   ```

5. **Click "Create"**

6. **Check Your Email**
   - Open the verification email from SendGrid
   - Click "Verify Single Sender"
   - You'll see: ✅ Sender verified!

---

### Step 2: Update Your .env File

Add this line to your `backend/.env`:

```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key_here
SMTP_FROM=your_verified_email@gmail.com
```

**Important:** 
- `SMTP_USER` stays as `apikey`
- `SMTP_FROM` is your verified sender email

---

### Step 3: Test Email

```bash
cd backend
node test-email.js
```

Expected:
```
✅ Email configuration found!
✅ SUCCESS! Email sent successfully!
```

---

## 🔍 Troubleshooting

### Error: "The from address does not match a verified Sender Identity"

**Solution:** You forgot to verify your sender!
1. Go to SendGrid → Settings → Sender Authentication
2. Verify a single sender
3. Use that email in `SMTP_FROM`

### Error: "Invalid API key"

**Solution:** 
1. Go to SendGrid → Settings → API Keys
2. Create new API key with "Mail Send" permission
3. Copy the key (starts with `SG.`)
4. Update `SMTP_PASS` in .env

### Email not arriving?

**Check:**
1. Spam folder
2. SendGrid Activity dashboard: https://app.sendgrid.com/email_activity
3. Sender is verified
4. API key is valid

---

## 📧 Your .env Should Look Like This

```env
# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.abc123xyz789...
SMTP_FROM=youremail@gmail.com
```

---

## ✅ Quick Checklist

- [ ] SendGrid account created
- [ ] Single sender verified (check email!)
- [ ] API key created
- [ ] .env updated with all 6 variables
- [ ] SMTP_FROM matches verified email
- [ ] Server restarted
- [ ] test-email.js runs successfully

---

## 🎯 Summary

**Problem:** SendGrid requires verified sender identity
**Solution:** Verify single sender in SendGrid dashboard
**Time:** 2 minutes
**Result:** Emails will send successfully ✅
