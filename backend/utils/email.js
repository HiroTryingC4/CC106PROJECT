const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
  !!(process.env.BREVO_API_KEY ||
    ((process.env.SMTP_USER || process.env.EMAIL_USER) &&
     (process.env.SMTP_PASS || process.env.EMAIL_PASS)));

const formatCurrency = (amount) =>
  `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

const formatTime = (timeString) => timeString || 'Not specified';

// Unified send — prefers Brevo API (works on Render), falls back to SMTP
const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.BREVO_API_KEY) {
    const { BrevoClient } = require('@getbrevo/brevo');
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
    const data = await client.transactionalEmails.sendTransacEmail({
      to: [{ email: to }],
      sender: {
        name: 'SmartStay',
        email: process.env.BREVO_FROM || process.env.SMTP_USER || 'smartstaynotification@gmail.com'
      },
      subject,
      htmlContent: html,
      textContent: text
    });
    return data.messageId;
  }

  // SMTP fallback
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
  const from = `"SmartStay" <${process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER}>`;
  const info = await transporter.sendMail({ from, to, subject, html, text });
  return info.messageId;
};

const sendBookingConfirmation = async ({
  guestEmail, guestName, bookingId, propertyTitle, propertyAddress,
  checkIn, checkOut, checkInTime, checkOutTime, guests, bookingType,
  totalAmount, paidAmount, remainingBalance, paymentMethod, transactionId,
  specialRequests, hostName, hostEmail, hostPhone
}) => {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping booking confirmation email.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}
.header{background:#4E7B22;color:white;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}
.content{background:#f9f9f9;padding:30px 20px;border:1px solid #ddd}
.section{background:white;padding:20px;margin-bottom:20px;border-radius:8px;border:1px solid #e0e0e0}
.section h2{color:#4E7B22;margin-top:0;border-bottom:2px solid #4E7B22;padding-bottom:10px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0}
.success{background:#d4edda;padding:15px;border-left:4px solid #28a745;margin:20px 0;border-radius:4px;color:#155724}
.warn{background:#fff3cd;padding:15px;border-left:4px solid #ffc107;margin:20px 0;border-radius:4px}
.btn{display:inline-block;padding:12px 30px;background:#4E7B22;color:white;text-decoration:none;border-radius:5px}
.footer{text-align:center;padding:20px;color:#666;font-size:14px;border-top:1px solid #ddd}
</style></head><body>
<div class="header"><h1>🏠 Booking Confirmed!</h1><p>Thank you for choosing SmartStay</p></div>
<div class="content">
  <div class="success"><strong>✓ Booking #${bookingId} confirmed!</strong></div>
  <p>Dear ${guestName},</p>
  <div class="section"><h2>📍 Property</h2>
    <div class="row"><span><strong>Property:</strong></span><span>${propertyTitle}</span></div>
    <div class="row"><span><strong>Location:</strong></span><span>${propertyAddress}</span></div>
    <div class="row"><span><strong>Type:</strong></span><span>${bookingType === 'fixed' ? 'Fixed Time' : 'Hourly'}</span></div>
  </div>
  <div class="section"><h2>📅 Reservation</h2>
    <div class="row"><span><strong>Check-in:</strong></span><span>${formatDate(checkIn)} at ${formatTime(checkInTime)}</span></div>
    <div class="row"><span><strong>Check-out:</strong></span><span>${formatDate(checkOut)} at ${formatTime(checkOutTime)}</span></div>
    <div class="row"><span><strong>Guests:</strong></span><span>${guests}</span></div>
    ${specialRequests ? `<div class="row"><span><strong>Special Requests:</strong></span><span>${specialRequests}</span></div>` : ''}
  </div>
  <div class="section"><h2>💳 Payment</h2>
    <div class="row"><span><strong>Total:</strong></span><span>${formatCurrency(totalAmount)}</span></div>
    <div class="row"><span><strong>Paid:</strong></span><span style="color:#28a745;font-weight:bold">${formatCurrency(paidAmount)}</span></div>
    ${remainingBalance > 0 ? `<div class="row"><span><strong>Remaining:</strong></span><span style="color:#ffc107;font-weight:bold">${formatCurrency(remainingBalance)}</span></div>` : ''}
    <div class="row"><span><strong>Method:</strong></span><span>${paymentMethod.toUpperCase()}</span></div>
    <div class="row"><span><strong>Transaction ID:</strong></span><span>${transactionId}</span></div>
  </div>
  ${remainingBalance > 0
    ? `<div class="warn"><strong>⚠️ Remaining balance of ${formatCurrency(remainingBalance)} is due upon check-in.</strong></div>`
    : `<div class="success"><strong>✓ Fully paid — no additional payment required!</strong></div>`}
  <div class="section"><h2>👤 Host</h2>
    <div class="row"><span><strong>Name:</strong></span><span>${hostName}</span></div>
    ${hostEmail ? `<div class="row"><span><strong>Email:</strong></span><span>${hostEmail}</span></div>` : ''}
    ${hostPhone ? `<div class="row"><span><strong>Phone:</strong></span><span>${hostPhone}</span></div>` : ''}
  </div>
  <div style="text-align:center;margin:30px 0">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/guest/bookings" class="btn">View Booking</a>
  </div>
</div>
<div class="footer"><p><strong>SmartStay</strong></p><p>© ${new Date().getFullYear()} SmartStay. All rights reserved.</p></div>
</body></html>`;

    const messageId = await sendEmail({
      to: guestEmail,
      subject: `Booking Confirmed - ${propertyTitle} (Booking #${bookingId})`,
      html,
      text: `Booking #${bookingId} confirmed for ${propertyTitle}.\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nTotal: ${formatCurrency(totalAmount)} | Paid: ${formatCurrency(paidAmount)}`
    });

    console.log('Booking confirmation email sent:', messageId);
    return { success: true, messageId, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message, message: 'Failed to send email' };
  }
};

const sendPaymentConfirmation = async ({
  guestEmail, guestName, bookingId, propertyTitle,
  amount, paymentMethod, transactionId, remainingBalance
}) => {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping payment confirmation email.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}
.header{background:#4E7B22;color:white;padding:30px 20px;text-align:center;border-radius:8px 8px 0 0}
.content{background:#f9f9f9;padding:30px 20px;border:1px solid #ddd}
.success{background:#d4edda;padding:15px;border-left:4px solid #28a745;margin:20px 0;border-radius:4px;color:#155724}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0}
.footer{text-align:center;padding:20px;color:#666;font-size:14px}
</style></head><body>
<div class="header"><h1>💳 Payment Received</h1></div>
<div class="content">
  <div class="success"><strong>✓ Payment Confirmed!</strong></div>
  <p>Dear ${guestName}, we received your payment for Booking #${bookingId}.</p>
  <div style="background:white;padding:20px;border-radius:8px;margin:20px 0">
    <div class="row"><span><strong>Property:</strong></span><span>${propertyTitle}</span></div>
    <div class="row"><span><strong>Amount Paid:</strong></span><span style="color:#28a745;font-weight:bold">${formatCurrency(amount)}</span></div>
    <div class="row"><span><strong>Method:</strong></span><span>${paymentMethod.toUpperCase()}</span></div>
    <div class="row"><span><strong>Transaction ID:</strong></span><span>${transactionId}</span></div>
    ${remainingBalance > 0 ? `<div class="row"><span><strong>Remaining Balance:</strong></span><span style="color:#ffc107;font-weight:bold">${formatCurrency(remainingBalance)}</span></div>` : ''}
  </div>
  <p>Thank you for your payment!</p>
</div>
<div class="footer"><p><strong>SmartStay</strong></p><p>© ${new Date().getFullYear()} SmartStay. All rights reserved.</p></div>
</body></html>`;

    const messageId = await sendEmail({
      to: guestEmail,
      subject: `Payment Received - Booking #${bookingId}`,
      html,
      text: `Payment of ${formatCurrency(amount)} received for Booking #${bookingId} (${propertyTitle}).`
    });

    console.log('Payment confirmation email sent:', messageId);
    return { success: true, messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { isEmailConfigured, sendBookingConfirmation, sendPaymentConfirmation };
