# Quick Email Setup

## Installation

```bash
cd backend
npm install nodemailer
```

## Configuration

Add to `backend/.env`:

```env
# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

## Gmail Setup (Easiest for Testing)

1. Enable 2FA on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Copy the 16-character password
5. Add to .env as `SMTP_PASS`

## What Gets Sent

When a booking is created with payment, the guest receives an email with:

- ✅ Booking confirmation with ID
- 📍 Property details and address
- 📅 Check-in/check-out dates and times
- 👥 Number of guests
- 💳 Payment summary (paid amount, remaining balance)
- 🔑 Transaction ID
- 👤 Host contact information
- 📋 Check-in instructions

## Testing

1. Configure email in .env
2. Restart server: `npm run dev`
3. Create a booking through the frontend
4. Check guest email for confirmation

## Troubleshooting

**No email sent?**
- Check server logs for "Email not configured" warning
- Verify SMTP credentials in .env
- Make sure you're using App Password, not regular password

**Email goes to spam?**
- Normal for development/testing
- For production, use SendGrid, Mailgun, or AWS SES

## Full Documentation

See `EMAIL_SETUP_GUIDE.md` for:
- Production email providers (SendGrid, Mailgun, AWS SES)
- Email template customization
- Advanced configuration
- Troubleshooting guide
