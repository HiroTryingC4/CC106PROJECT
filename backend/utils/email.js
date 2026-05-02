const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10),
    secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  };

  return nodemailer.createTransport(config);
};

// Check if email is configured
const isEmailConfigured = () => {
  return !!((process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS));
};

// Format currency
const formatCurrency = (amount) => {
  return `₱${Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Format time
const formatTime = (timeString) => {
  if (!timeString) return 'Not specified';
  return timeString;
};

// Send booking confirmation email to guest
const sendBookingConfirmation = async ({
  guestEmail,
  guestName,
  bookingId,
  propertyTitle,
  propertyAddress,
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
  guests,
  bookingType,
  totalAmount,
  paidAmount,
  remainingBalance,
  paymentMethod,
  transactionId,
  specialRequests,
  hostName,
  hostEmail,
  hostPhone
}) => {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping booking confirmation email.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4E7B22;
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px 20px;
      border: 1px solid #ddd;
    }
    .section {
      background-color: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .section h2 {
      color: #4E7B22;
      margin-top: 0;
      font-size: 20px;
      border-bottom: 2px solid #4E7B22;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #666;
    }
    .info-value {
      color: #333;
      text-align: right;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
      border-radius: 4px;
    }
    .success {
      background-color: #d4edda;
      padding: 15px;
      border-left: 4px solid #28a745;
      margin: 20px 0;
      border-radius: 4px;
      color: #155724;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #4E7B22;
      text-align: center;
      padding: 20px;
      background-color: #f0f8e8;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #ddd;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4E7B22;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 Booking Confirmed!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing SmartStay</p>
  </div>
  
  <div class="content">
    <div class="success">
      <strong>✓ Your booking has been confirmed!</strong><br>
      Booking ID: <strong>#${bookingId}</strong>
    </div>

    <p>Dear ${guestName},</p>
    <p>Your booking has been successfully confirmed and payment has been received. Below are the details of your reservation:</p>

    <div class="section">
      <h2>📍 Property Details</h2>
      <div class="info-row">
        <span class="info-label">Property:</span>
        <span class="info-value">${propertyTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Location:</span>
        <span class="info-value">${propertyAddress}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Booking Type:</span>
        <span class="info-value">${bookingType === 'fixed' ? 'Fixed Time' : 'Hourly'}</span>
      </div>
    </div>

    <div class="section">
      <h2>📅 Reservation Details</h2>
      <div class="info-row">
        <span class="info-label">Check-in:</span>
        <span class="info-value">${formatDate(checkIn)} at ${formatTime(checkInTime)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Check-out:</span>
        <span class="info-value">${formatDate(checkOut)} at ${formatTime(checkOutTime)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Number of Guests:</span>
        <span class="info-value">${guests}</span>
      </div>
      ${specialRequests ? `
      <div class="info-row">
        <span class="info-label">Special Requests:</span>
        <span class="info-value">${specialRequests}</span>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>💳 Payment Summary</h2>
      <div class="info-row">
        <span class="info-label">Total Amount:</span>
        <span class="info-value">${formatCurrency(totalAmount)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Paid:</span>
        <span class="info-value" style="color: #28a745; font-weight: bold;">${formatCurrency(paidAmount)}</span>
      </div>
      ${remainingBalance > 0 ? `
      <div class="info-row">
        <span class="info-label">Remaining Balance:</span>
        <span class="info-value" style="color: #ffc107; font-weight: bold;">${formatCurrency(remainingBalance)}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${paymentMethod.toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value">${transactionId}</span>
      </div>
    </div>

    ${remainingBalance > 0 ? `
    <div class="highlight">
      <strong>⚠️ Remaining Balance:</strong><br>
      You have a remaining balance of <strong>${formatCurrency(remainingBalance)}</strong> which can be paid upon check-in or through the SmartStay platform.
    </div>
    ` : `
    <div class="success">
      <strong>✓ Fully Paid:</strong><br>
      Your booking is fully paid. No additional payment required!
    </div>
    `}

    <div class="section">
      <h2>👤 Host Information</h2>
      <div class="info-row">
        <span class="info-label">Host Name:</span>
        <span class="info-value">${hostName}</span>
      </div>
      ${hostEmail ? `
      <div class="info-row">
        <span class="info-label">Host Email:</span>
        <span class="info-value">${hostEmail}</span>
      </div>
      ` : ''}
      ${hostPhone ? `
      <div class="info-row">
        <span class="info-label">Host Phone:</span>
        <span class="info-value">${hostPhone}</span>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>📋 Important Information</h2>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Please arrive at the check-in time specified above</li>
        <li>Bring a valid ID for verification</li>
        <li>Contact the host if you need to make any changes</li>
        <li>Check-in instructions will be sent 24 hours before arrival</li>
        ${remainingBalance > 0 ? '<li>Remaining balance must be paid before or upon check-in</li>' : ''}
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p>Need to make changes or have questions?</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/guest/bookings" class="button">View Booking Details</a>
    </div>
  </div>

  <div class="footer">
    <p><strong>SmartStay Bookings</strong></p>
    <p>This is an automated email. Please do not reply to this message.</p>
    <p>If you have any questions, please contact your host or visit our support page.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} SmartStay. All rights reserved.
    </p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"SmartStay Bookings" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: guestEmail,
      subject: `Booking Confirmed - ${propertyTitle} (Booking #${bookingId})`,
      html: emailHtml,
      text: `
Booking Confirmation - SmartStay

Dear ${guestName},

Your booking has been confirmed!

Booking ID: #${bookingId}

Property Details:
- Property: ${propertyTitle}
- Location: ${propertyAddress}
- Booking Type: ${bookingType === 'fixed' ? 'Fixed Time' : 'Hourly'}

Reservation Details:
- Check-in: ${formatDate(checkIn)} at ${formatTime(checkInTime)}
- Check-out: ${formatDate(checkOut)} at ${formatTime(checkOutTime)}
- Guests: ${guests}
${specialRequests ? `- Special Requests: ${specialRequests}` : ''}

Payment Summary:
- Total Amount: ${formatCurrency(totalAmount)}
- Amount Paid: ${formatCurrency(paidAmount)}
${remainingBalance > 0 ? `- Remaining Balance: ${formatCurrency(remainingBalance)}` : ''}
- Payment Method: ${paymentMethod.toUpperCase()}
- Transaction ID: ${transactionId}

Host Information:
- Host Name: ${hostName}
${hostEmail ? `- Host Email: ${hostEmail}` : ''}
${hostPhone ? `- Host Phone: ${hostPhone}` : ''}

Thank you for choosing SmartStay!

---
SmartStay Bookings
${process.env.FRONTEND_URL || 'http://localhost:3000'}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email' 
    };
  }
};

// Send payment confirmation email
const sendPaymentConfirmation = async ({
  guestEmail,
  guestName,
  bookingId,
  propertyTitle,
  amount,
  paymentMethod,
  transactionId,
  remainingBalance
}) => {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping payment confirmation email.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4E7B22; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px 20px; border: 1px solid #ddd; }
    .success { background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px; color: #155724; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💳 Payment Received</h1>
  </div>
  <div class="content">
    <div class="success">
      <strong>✓ Payment Confirmed!</strong>
    </div>
    <p>Dear ${guestName},</p>
    <p>We have received your payment for booking #${bookingId}.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <div class="info-row">
        <span><strong>Property:</strong></span>
        <span>${propertyTitle}</span>
      </div>
      <div class="info-row">
        <span><strong>Amount Paid:</strong></span>
        <span style="color: #28a745; font-weight: bold;">${formatCurrency(amount)}</span>
      </div>
      <div class="info-row">
        <span><strong>Payment Method:</strong></span>
        <span>${paymentMethod.toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span><strong>Transaction ID:</strong></span>
        <span>${transactionId}</span>
      </div>
      ${remainingBalance > 0 ? `
      <div class="info-row">
        <span><strong>Remaining Balance:</strong></span>
        <span style="color: #ffc107; font-weight: bold;">${formatCurrency(remainingBalance)}</span>
      </div>
      ` : ''}
    </div>
    <p>Thank you for your payment!</p>
  </div>
  <div class="footer">
    <p><strong>SmartStay Bookings</strong></p>
    <p>© ${new Date().getFullYear()} SmartStay. All rights reserved.</p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"SmartStay Bookings" <${process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: guestEmail,
      subject: `Payment Received - Booking #${bookingId}`,
      html: emailHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  isEmailConfigured,
  sendBookingConfirmation,
  sendPaymentConfirmation
};
