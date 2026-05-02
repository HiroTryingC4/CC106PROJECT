require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { sendBookingConfirmation, isEmailConfigured } = require('./utils/email');

console.log('=================================');
console.log('Email Configuration Test');
console.log('=================================\n');

// Check if email is configured
if (!isEmailConfigured()) {
  console.error('❌ Email is NOT configured!');
  console.log('\nPlease add these to your .env file:');
  console.log('SMTP_HOST=smtp.sendgrid.net');
  console.log('SMTP_PORT=587');
  console.log('SMTP_USER=apikey');
  console.log('SMTP_PASS=SG.your_sendgrid_api_key');
  process.exit(1);
}

console.log('✅ Email configuration found!\n');
console.log('SMTP Host:', process.env.SMTP_HOST || process.env.EMAIL_HOST);
console.log('SMTP Port:', process.env.SMTP_PORT || process.env.EMAIL_PORT);
console.log('SMTP User:', process.env.SMTP_USER || process.env.EMAIL_USER);
console.log('SMTP Pass:', (process.env.SMTP_PASS || process.env.EMAIL_PASS) ? '***' + (process.env.SMTP_PASS || process.env.EMAIL_PASS).slice(-4) : 'NOT SET');
console.log('\n=================================');
console.log('Sending test email...');
console.log('=================================\n');

// Send test email
sendBookingConfirmation({
  guestEmail: process.env.EMAIL_USER || process.env.SMTP_USER, // Send to yourself for testing
  guestName: 'Test User',
  bookingId: 99999,
  propertyTitle: 'Cozy Beach House - TEST',
  propertyAddress: '123 Beach Road, Coastal City, Test State',
  checkIn: new Date().toISOString(),
  checkOut: new Date(Date.now() + 86400000 * 3).toISOString(),
  checkInTime: '15:00',
  checkOutTime: '11:00',
  guests: 2,
  bookingType: 'fixed',
  totalAmount: 15000,
  paidAmount: 5000,
  remainingBalance: 10000,
  paymentMethod: 'gcash',
  transactionId: 'TEST-' + Date.now(),
  specialRequests: 'This is a test email from SmartStay booking system',
  hostName: 'Test Host',
  hostEmail: 'host@example.com',
  hostPhone: '+639123456789'
}).then(result => {
  console.log('\n=================================');
  if (result.success) {
    console.log('✅ SUCCESS! Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\nCheck your inbox for the test email.');
    console.log('If using SendGrid, also check: https://app.sendgrid.com/email_activity');
  } else {
    console.log('❌ FAILED! Email could not be sent.');
    console.log('Error:', result.message);
    if (result.error) {
      console.log('Details:', result.error);
    }
  }
  console.log('=================================\n');
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.log('\n=================================');
  console.error('❌ ERROR! Unexpected error occurred:');
  console.error(error);
  console.log('=================================\n');
  process.exit(1);
});
