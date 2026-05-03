const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Check which email provider is configured
const isBrevoConfigured = () => !!process.env.BREVO_API_KEY;
const isResendConfigured = () => !!process.env.RESEND_API_KEY;
const isSmtpConfigured = () => !!((process.env.SMTP_USER || process.env.EMAIL_USER) && (process.env.SMTP_PASS || process.env.EMAIL_PASS));
const isEmailConfigured = () => isBrevoConfigured() || isResendConfigured() || isSmtpConfigured();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10),
    secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  if (!isEmailConfigured()) {
    console.warn('Email not configured. Skipping verification email.');
    return { success: false, message: 'Email not configured' };
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
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
    .button {
      display: inline-block;
      padding: 15px 40px;
      background-color: #4E7B22;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      font-size: 16px;
    }
    .button:hover {
      background-color: #3d6119;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #ddd;
      margin-top: 20px;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 Welcome to SmartStay!</h1>
  </div>
  
  <div class="content">
    <p>Hi <strong>${firstName}</strong>,</p>
    
    <p>Thank you for registering with SmartStay! We're excited to have you join our community of travelers and hosts.</p>
    
    <p>To complete your registration and start booking amazing properties, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #4E7B22; background: white; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
    
    <div class="highlight">
      <strong>⚠️ Important:</strong> This verification link will expire in <strong>24 hours</strong>.
    </div>
    
    <p>If you didn't create an account with SmartStay, please ignore this email.</p>
  </div>
  
  <div class="footer">
    <p><strong>SmartStay</strong></p>
    <p>This is an automated email. Please do not reply to this message.</p>
    <p style="margin-top: 20px; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} SmartStay. All rights reserved.
    </p>
  </div>
</body>
</html>
    `;
    
  try {
    // Use Brevo if configured (works on Render free tier)
    if (isBrevoConfigured()) {
      const { BrevoClient } = require('@getbrevo/brevo');
      const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
      const data = await client.sendTransacEmail({
        to: [{ email }],
        sender: { name: 'SmartStay', email: process.env.BREVO_FROM || 'smartstaynotification@gmail.com' },
        subject: 'Verify Your Email - SmartStay',
        htmlContent: emailHtml
      });
      console.log('Verification email sent via Brevo:', data.messageId);
      return { success: true, messageId: data.messageId, message: 'Email sent successfully' };
    }

    // Use Resend if configured
    if (isResendConfigured()) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'SmartStay <onboarding@resend.dev>',
        to: email,
        subject: 'Verify Your Email - SmartStay',
        html: emailHtml
      });
      if (error) throw new Error(error.message);
      console.log('Verification email sent via Resend:', data.id);
      return { success: true, messageId: data.id, message: 'Email sent successfully' };
    }

    // Fallback to SMTP
    const transporter = createTransporter();
    const mailOptions = {
      from: `"SmartStay" <${process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - SmartStay',
      html: emailHtml
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message, message: 'Failed to send email' };
  }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Smart Stay" <noreply@smartstay.com>',
    to: email,
    subject: 'Reset Your Password - Smart Stay',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4E7B22; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4E7B22; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We received a request to reset your password for your Smart Stay account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4E7B22;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smart Stay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${firstName},
      
      We received a request to reset your password for your Smart Stay account.
      
      Click this link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
      
      © ${new Date().getFullYear()} Smart Stay. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  isEmailConfigured
};
