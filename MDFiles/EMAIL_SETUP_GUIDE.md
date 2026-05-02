# Email Setup Guide

## Overview
The SmartStay booking system sends automated emails to guests after successful bookings. This guide explains how to configure email functionality.

## Email Features

### Booking Confirmation Email
Sent automatically when a booking is created with payment. Includes:
- ✅ Booking ID and confirmation status
- 📍 Property details and location
- 📅 Check-in/check-out dates and times
- 👥 Number of guests
- 💳 Payment summary (amount paid, remaining balance)
- 🔑 Transaction ID
- 👤 Host contact information
- 📋 Important check-in instructions

### Payment Confirmation Email
Sent when additional payments are made on existing bookings. Includes:
- 💳 Payment amount and method
- 🔑 Transaction ID
- 💰 Remaining balance (if any)

## Setup Options

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "SmartStay Backend"
4. Click "Generate"
5. Copy the 16-character password

#### Step 3: Configure .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

**Important Notes:**
- Use App Password, NOT your regular Gmail password
- Gmail has a sending limit of 500 emails/day for free accounts
- For production, consider using a dedicated email service

---

### Option 2: SendGrid (Recommended for Production)

#### Step 1: Create SendGrid Account
1. Sign up at: https://sendgrid.com
2. Verify your email address
3. Complete sender authentication

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access" (with Mail Send permission)
4. Copy the API key

#### Step 3: Configure .env
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Benefits:**
- ✅ 100 emails/day free tier
- ✅ Better deliverability
- ✅ Email analytics
- ✅ No daily sending limits on paid plans

---

### Option 3: Mailgun

#### Step 1: Create Mailgun Account
1. Sign up at: https://www.mailgun.com
2. Verify your domain (or use sandbox domain for testing)

#### Step 2: Get SMTP Credentials
1. Go to Sending → Domain Settings
2. Click on your domain
3. Find SMTP credentials section

#### Step 3: Configure .env
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_mailgun_password
```

**Benefits:**
- ✅ 5,000 emails/month free
- ✅ Excellent deliverability
- ✅ Advanced analytics

---

### Option 4: AWS SES (Best for High Volume)

#### Step 1: Set Up AWS SES
1. Log in to AWS Console
2. Navigate to Amazon SES
3. Verify your email address or domain
4. Request production access (starts in sandbox mode)

#### Step 2: Create SMTP Credentials
1. Go to SMTP Settings
2. Click "Create My SMTP Credentials"
3. Download credentials

#### Step 3: Configure .env
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_ses_smtp_username
SMTP_PASS=your_ses_smtp_password
```

**Benefits:**
- ✅ $0.10 per 1,000 emails
- ✅ Highly scalable
- ✅ Excellent deliverability
- ✅ Integrates with other AWS services

---

## Installation

### 1. Install nodemailer
```bash
cd backend
npm install nodemailer
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your SMTP credentials:
```bash
cp .env.example .env
```

Edit `.env` and add your email configuration:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Restart Server
```bash
npm run dev
```

## Testing Email Functionality

### Test 1: Create a Booking
1. Go to frontend and create a booking
2. Complete payment
3. Check guest email for confirmation

### Test 2: Check Logs
Look for these messages in server logs:
```
Booking confirmation email sent: <message-id>
```

### Test 3: Manual Test
Create a test script `test-email.js`:
```javascript
require('dotenv').config();
const { sendBookingConfirmation } = require('./utils/email');

sendBookingConfirmation({
  guestEmail: 'test@example.com',
  guestName: 'Test User',
  bookingId: 123,
  propertyTitle: 'Test Property',
  propertyAddress: '123 Test St, Test City',
  checkIn: new Date().toISOString(),
  checkOut: new Date(Date.now() + 86400000).toISOString(),
  checkInTime: '15:00',
  checkOutTime: '11:00',
  guests: 2,
  bookingType: 'fixed',
  totalAmount: 5000,
  paidAmount: 2000,
  remainingBalance: 3000,
  paymentMethod: 'gcash',
  transactionId: 'TEST123',
  specialRequests: 'Test request',
  hostName: 'Test Host',
  hostEmail: 'host@example.com',
  hostPhone: '+639123456789'
}).then(result => {
  console.log('Email test result:', result);
  process.exit(0);
}).catch(error => {
  console.error('Email test error:', error);
  process.exit(1);
});
```

Run test:
```bash
node test-email.js
```

## Troubleshooting

### Issue: "Invalid login" error with Gmail
**Solution:** Make sure you're using an App Password, not your regular password. Enable 2FA first.

### Issue: Emails going to spam
**Solutions:**
1. Verify your domain with your email provider
2. Set up SPF, DKIM, and DMARC records
3. Use a dedicated email service (SendGrid, Mailgun, SES)
4. Avoid spam trigger words in subject/content

### Issue: "Connection timeout"
**Solutions:**
1. Check firewall settings (allow port 587)
2. Try port 465 with `SMTP_SECURE=true`
3. Verify SMTP host is correct
4. Check if your hosting provider blocks SMTP

### Issue: Emails not sending but no errors
**Solution:** Check if email configuration is set. The system gracefully skips email if not configured:
```javascript
if (!isEmailConfigured()) {
  console.warn('Email not configured. Skipping email.');
}
```

### Issue: Rate limiting
**Solutions:**
1. Gmail: Max 500/day - upgrade to Google Workspace
2. SendGrid: Max 100/day free - upgrade plan
3. Implement email queue for high volume
4. Add retry logic with exponential backoff

## Email Templates

### Customizing Templates
Email templates are in `backend/utils/email.js`. To customize:

1. Edit HTML template in `sendBookingConfirmation` function
2. Modify styles in `<style>` section
3. Add/remove sections as needed
4. Test changes with test script

### Template Variables
Available variables in booking confirmation:
- `guestName` - Guest's full name
- `bookingId` - Booking ID number
- `propertyTitle` - Property name
- `propertyAddress` - Full address
- `checkIn` / `checkOut` - Date strings
- `checkInTime` / `checkOutTime` - Time strings
- `guests` - Number of guests
- `bookingType` - 'fixed' or 'hourly'
- `totalAmount` - Total booking cost
- `paidAmount` - Amount already paid
- `remainingBalance` - Amount still owed
- `paymentMethod` - Payment method used
- `transactionId` - Payment transaction ID
- `specialRequests` - Guest's special requests
- `hostName` / `hostEmail` / `hostPhone` - Host contact info

## Production Checklist

- [ ] Email credentials configured in production .env
- [ ] Domain verified with email provider
- [ ] SPF/DKIM/DMARC records set up
- [ ] Test emails sent successfully
- [ ] Emails not going to spam
- [ ] Error logging configured
- [ ] Email queue implemented (for high volume)
- [ ] Monitoring/alerts set up for email failures
- [ ] Unsubscribe link added (if required by law)
- [ ] Privacy policy updated with email usage

## Security Best Practices

1. **Never commit credentials**: Keep .env out of git
2. **Use App Passwords**: Don't use main account passwords
3. **Rotate credentials**: Change passwords regularly
4. **Limit permissions**: Use restricted API keys when possible
5. **Monitor usage**: Watch for unusual sending patterns
6. **Encrypt in transit**: Always use TLS (port 587 or 465)
7. **Validate recipients**: Sanitize email addresses
8. **Rate limit**: Prevent abuse with rate limiting

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Gmail | 500/day | N/A | Development |
| SendGrid | 100/day | $15/mo (40k) | Small-Medium |
| Mailgun | 5,000/mo | $35/mo (50k) | Medium |
| AWS SES | 62,000/mo* | $0.10/1k | High Volume |

*First 62,000 emails free when sent from EC2

## Support

For issues with email functionality:
1. Check server logs for error messages
2. Verify .env configuration
3. Test with manual test script
4. Check email provider status page
5. Review troubleshooting section above

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP Guide](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [AWS SES SMTP Guide](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
