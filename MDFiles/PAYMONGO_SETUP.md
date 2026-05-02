# PayMongo Payment Integration

This project uses PayMongo sandbox for payment processing.

## Setup Instructions

### 1. PayMongo Account Setup
1. Sign up for a PayMongo account at https://dashboard.paymongo.com/signup
2. Verify your email and complete the registration
3. Navigate to Developers > API Keys
4. Copy your **Test Secret Key** and **Test Public Key**

### 2. Environment Configuration

The `.env` file should contain your own PayMongo keys:
```
PAYMONGO_SECRET_KEY=your_test_secret_key_here
PAYMONGO_PUBLIC_KEY=your_test_public_key_here
```

**Note:** These are test keys for sandbox environment. Never commit real API keys to the repository.

### 3. Webhook Setup (Optional)

To receive real-time payment updates:

1. Go to PayMongo Dashboard > Developers > Webhooks
2. Create a new webhook with URL: `https://your-domain.com/api/payments/webhook`
3. Select events:
   - `source.chargeable` (for GCash/PayMaya)
   - `payment.paid`
   - `payment.failed`

For local development, use ngrok:
```bash
ngrok http 5000
# Use the ngrok URL: https://xxxxx.ngrok.io/api/payments/webhook
```

### 4. Frontend Routes

Add these routes to your React Router configuration:

```javascript
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';

// In your routes:
<Route path="/payment/success" element={<PaymentSuccess />} />
<Route path="/payment/failed" element={<PaymentFailed />} />
```

### 5. Using the Payment Component

```javascript
import PayMongoPayment from './components/payment/PayMongoPayment';

function BookingPayment() {
  const handleSuccess = (data) => {
    console.log('Payment successful:', data);
    // Handle success
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    // Handle error
  };

  return (
    <PayMongoPayment
      bookingId={123}
      amount={5000.00}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

## Testing

### Test Payment Methods

**GCash Test:**
1. Select GCash as payment method
2. Click "Pay with GCash"
3. You'll be redirected to PayMongo's test checkout page
4. Use test credentials provided by PayMongo

**PayMaya Test:**
1. Select PayMaya as payment method
2. Click "Pay with PayMaya"
3. Follow the test checkout flow

### Test Card Numbers (if using card payments)

- **Success:** 4343434343434345
- **Failed:** 4571736000000075
- **3D Secure:** 4120000000000007

**CVV:** Any 3 digits
**Expiry:** Any future date

## API Endpoints

### GET /api/payments/config
Get payment configuration and supported methods

### POST /api/payments/create-source
Create a payment source for GCash/PayMaya
```json
{
  "bookingId": 123,
  "amount": 5000.00,
  "paymentMethod": "gcash",
  "billing": {
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "phone": "09123456789"
  }
}
```

### POST /api/payments/webhook
Webhook endpoint for PayMongo events (handled automatically)

## Payment Flow

1. User selects payment method (GCash/PayMaya)
2. Frontend calls `/api/payments/create-source`
3. Backend creates PayMongo source and returns checkout URL
4. User is redirected to PayMongo checkout
5. User completes payment
6. PayMongo redirects to success/failed page
7. Webhook updates payment status in database
8. User receives notification

## Troubleshooting

**Payment not updating:**
- Check webhook is configured correctly
- Verify webhook URL is accessible
- Check backend logs for webhook errors

**Checkout URL not working:**
- Ensure FRONTEND_URL is set in .env
- Verify PayMongo keys are correct
- Check if sandbox mode is enabled

**Database errors:**
- Ensure payments table exists
- Check database connection
- Verify user has permission to create payments

## Security Notes

- Never expose secret keys in frontend code
- Always validate payment amounts on backend
- Verify webhook signatures in production
- Use HTTPS in production
- Store sensitive data encrypted

## Production Deployment

1. Replace test keys with live keys
2. Update webhook URL to production domain
3. Enable webhook signature verification
4. Set up proper error monitoring
5. Test thoroughly before going live
