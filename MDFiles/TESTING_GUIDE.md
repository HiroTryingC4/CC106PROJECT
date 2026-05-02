# PayMongo Payment Testing Guide

## Quick Start - Testing in 5 Minutes

### Step 1: Start Your Servers

**Backend:**
```bash
cd backend
npm start
# Should run on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm start
# Should run on http://localhost:3000 or http://localhost:5173
```

### Step 2: Access the Test Page

1. Open your browser
2. Go to: **http://localhost:3000/payment/test** (or your frontend URL)
3. Make sure you're logged in (any user account works)

### Step 3: Test Payment Flow

#### Option A: Test with Existing Booking
1. If you have bookings, they'll appear on the test page
2. Select a booking
3. Choose payment method (GCash or PayMaya)
4. Click "Pay with GCash" or "Pay with PayMaya"

#### Option B: Test with Custom Amount
1. Select "Use Custom Amount"
2. Enter amount (e.g., 1000.00)
3. Or use quick test buttons: ₱100, ₱500, ₱1000, ₱5000
4. Choose payment method
5. Click "Pay"

### Step 4: Complete Payment on PayMongo

After clicking Pay:
1. You'll be redirected to PayMongo's test checkout page
2. You'll see a test payment interface
3. **For GCash/PayMaya in sandbox:**
   - Click "Simulate Success" to test successful payment
   - Click "Simulate Failure" to test failed payment
4. You'll be redirected back to your app

### Step 5: Verify Results

**Success Flow:**
- Redirected to `/payment/success`
- See success message
- Auto-redirect to bookings after 5 seconds
- Check database: payment status should be "completed"

**Failed Flow:**
- Redirected to `/payment/failed`
- See error message
- Option to try again

## Testing Different Scenarios

### Scenario 1: Successful GCash Payment
```
1. Go to /payment/test
2. Enter amount: ₱1,000.00
3. Select: GCash
4. Click: Pay with GCash
5. On PayMongo page: Click "Simulate Success"
6. Verify: Redirected to success page
```

### Scenario 2: Failed PayMaya Payment
```
1. Go to /payment/test
2. Enter amount: ₱500.00
3. Select: PayMaya
4. Click: Pay with PayMaya
5. On PayMongo page: Click "Simulate Failure"
6. Verify: Redirected to failed page
```

### Scenario 3: Test with Real Booking
```
1. Create a booking as guest
2. Go to /payment/test
3. Select your booking from the list
4. Complete payment flow
5. Check booking payment status updated
```

## Checking Payment Status

### In Database:
```sql
-- Check payments table
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;

-- Check booking payment status
SELECT id, payment_status, status FROM bookings WHERE id = YOUR_BOOKING_ID;
```

### In Application:
1. Guest Dashboard → View Bookings
2. Check payment status badge
3. Should show: "Paid", "Pending", or "Failed"

## API Endpoints to Test Manually

### 1. Get Payment Config
```bash
curl -X GET http://localhost:5000/api/payments/config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "paymongoConfigured": true,
  "publicKey": "pk_test_...",
  "supportedMethods": ["gcash", "paymaya", "card"]
}
```

### 2. Create Payment Source
```bash
curl -X POST http://localhost:5000/api/payments/create-source \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "amount": 1000.00,
    "paymentMethod": "gcash",
    "billing": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "09123456789"
    }
  }'
```

Expected Response:
```json
{
  "sourceId": "src_...",
  "checkoutUrl": "https://pm.link/...",
  "status": "pending"
}
```

## Troubleshooting

### Issue: "Payment system is not configured"
**Solution:**
- Check backend/.env has PAYMONGO_SECRET_KEY and PAYMONGO_PUBLIC_KEY
- Restart backend server
- Verify keys are correct (start with sk_test_ and pk_test_)

### Issue: "Failed to create payment source"
**Solution:**
- Check backend logs for error details
- Verify amount is at least ₱100.00
- Ensure booking exists and belongs to user
- Check internet connection (PayMongo API call)

### Issue: Redirect not working
**Solution:**
- Check FRONTEND_URL in backend/.env
- Should be: http://localhost:3000 or your frontend URL
- Restart backend after changing .env

### Issue: Webhook not updating payment
**Solution:**
- Webhooks don't work on localhost without ngrok
- For local testing, manually update payment status:
```sql
UPDATE payments SET status = 'completed' WHERE id = YOUR_PAYMENT_ID;
```

### Issue: "Booking not found"
**Solution:**
- Create a booking first as guest user
- Or use custom amount option (doesn't require real booking)

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running
- [ ] Logged in as any user
- [ ] Can access /payment/test page
- [ ] Can see payment methods (GCash, PayMaya)
- [ ] Can enter custom amount
- [ ] Click Pay redirects to PayMongo
- [ ] Can simulate success on PayMongo page
- [ ] Redirected back to success page
- [ ] Can simulate failure on PayMongo page
- [ ] Redirected back to failed page
- [ ] Payment record created in database
- [ ] Booking payment status updated (if using real booking)

## Next Steps After Testing

1. **Integrate into Booking Flow:**
   - Add PayMongoPayment component to booking confirmation page
   - Replace manual payment with PayMongo checkout

2. **Set Up Webhooks (Optional for Production):**
   - Use ngrok for local testing
   - Configure webhook URL in PayMongo dashboard
   - Test real-time payment updates

3. **Add More Payment Methods:**
   - Card payments (requires additional setup)
   - Bank transfers
   - Other e-wallets

4. **Production Deployment:**
   - Replace test keys with live keys
   - Update redirect URLs
   - Enable webhook signature verification
   - Add proper error handling and logging

## Support

If you encounter issues:
1. Check backend console logs
2. Check browser console for errors
3. Verify .env configuration
4. Check PayMongo dashboard for test transactions
5. Review PAYMONGO_SETUP.md for detailed setup

## Test Data Summary

**Test Amounts:** ₱100, ₱500, ₱1000, ₱5000
**Payment Methods:** GCash, PayMaya
**Test Mode:** Sandbox (no real money)
**Redirect URLs:** 
- Success: /payment/success
- Failed: /payment/failed
