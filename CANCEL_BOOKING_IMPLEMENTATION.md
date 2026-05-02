# Cancel Booking Implementation

## Overview
Implemented proper cancel booking functionality with refund logic, cancellation policies, time-based restrictions, and notifications for both guests and hosts.

## Features Implemented

### 1. Cancellation Policy (Time-Based Refunds)
- **48+ hours before check-in**: 100% refund
- **24-48 hours before check-in**: 50% refund
- **Less than 24 hours before check-in**: No refund

### 2. Business Logic Restrictions
- Cannot cancel bookings that have already started (past check-in date)
- Cannot cancel already cancelled bookings
- Cannot cancel completed bookings
- Only guests and hosts can cancel their own bookings

### 3. Refund Processing
- Calculates refund based on completed payments only
- Updates payment status to 'refunded' when applicable
- Updates booking payment_status to 'refunded'
- Stores refund details in booking metadata

### 4. Notifications
- Sends notification to the other party (guest or host)
- Includes refund information in notification message
- WebSocket real-time notification support
- Fire-and-forget async notification handling

### 5. Metadata Storage
Cancellation details stored in `bookings.metadata.cancellation`:
```json
{
  "cancelledBy": "guest|host",
  "cancelledAt": "ISO timestamp",
  "hoursBeforeCheckIn": 72.5,
  "policy": "Full refund (48+ hours notice)",
  "refundPercentage": 100,
  "totalPaid": 5000.00,
  "refundAmount": 5000.00
}
```

## Backend Changes

### New Endpoint: GET /api/bookings/:id/cancellation-policy
Returns cancellation policy information before user confirms:
```json
{
  "canCancel": true,
  "policy": "Full refund (48+ hours notice)",
  "refundPercentage": 100,
  "hoursUntilCheckIn": 72.5,
  "totalPaid": 5000.00,
  "refundAmount": 5000.00
}
```

Or if cannot cancel:
```json
{
  "canCancel": false,
  "reason": "Cannot cancel a booking that has already started"
}
```

### Enhanced Endpoint: DELETE /api/bookings/:id
Now includes:
- Validation checks (status, start date)
- Cancellation policy calculation
- Refund amount calculation based on completed payments
- Payment status updates
- Metadata storage
- Notifications to other party
- Returns cancellation details in response

Response format:
```json
{
  "message": "Booking cancelled successfully",
  "booking": { /* booking object */ },
  "cancellation": {
    "policy": "Full refund (48+ hours notice)",
    "refundPercentage": 100,
    "refundAmount": 5000.00,
    "totalPaid": 5000.00
  }
}
```

## Frontend Changes

### Guest Side (BookingDetails.js)
1. **Cancellation Modal**: Shows policy details before confirmation
   - Hours until check-in
   - Total paid amount
   - Refund percentage
   - Refund amount
   - Policy description
   - Warning if no refund

2. **API Integration**: Fetches cancellation policy from backend
3. **Success Feedback**: Shows refund details after successful cancellation

### Host Side (HostBookings.js)
1. **Cancel Button**: Added for pending and confirmed bookings
2. **Cancellation Modal**: Same as guest side but shows "Refund to guest"
3. **List View**: Cancel button in booking cards
4. **Detail Modal**: Cancel button in booking details modal

## Error Handling

### Backend Errors
- 400: Booking already cancelled/completed or has started
- 401: No authentication
- 403: Access denied (not owner)
- 404: Booking not found
- 500: Server error

### Frontend Errors
- Network errors handled with try-catch
- User-friendly error messages via alerts
- Loading states during API calls
- Disabled buttons during processing

## Database Schema

No schema changes required. Uses existing:
- `bookings.status` - Updated to 'cancelled'
- `bookings.metadata` - Stores cancellation details (JSONB)
- `bookings.payment_status` - Updated to 'refunded' if applicable
- `payments.status` - Updated to 'refunded' for completed payments

## Testing Scenarios

### Scenario 1: Guest cancels 3 days before check-in
- ✅ 100% refund
- ✅ Host receives notification
- ✅ Payment status updated to 'refunded'

### Scenario 2: Host cancels 30 hours before check-in
- ✅ 50% refund to guest
- ✅ Guest receives notification
- ✅ Partial refund calculated correctly

### Scenario 3: Guest tries to cancel 12 hours before check-in
- ✅ No refund
- ✅ Cancellation still allowed
- ✅ Host notified

### Scenario 4: User tries to cancel after check-in
- ✅ Blocked with error message
- ✅ "Cannot cancel a booking that has already started"

### Scenario 5: User tries to cancel completed booking
- ✅ Blocked with error message
- ✅ "Cannot cancel a completed booking"

## Future Enhancements (Not Implemented)

1. **Configurable Policies**: Allow hosts to set custom cancellation policies per property
2. **Partial Refund Processing**: Integration with PayMongo refund API
3. **Cancellation Fees**: Deduct processing fees from refunds
4. **Email Notifications**: Send cancellation confirmation emails
5. **Cancellation History**: Track all cancellation attempts
6. **Dispute System**: Allow users to dispute cancellation terms
7. **Grace Period**: Allow free cancellation within X minutes of booking

## Notes

- Refund amounts are calculated but not automatically processed through payment gateway
- Manual refund processing required by admin/host
- WebSocket notifications are fire-and-forget (non-blocking)
- All monetary calculations use 2 decimal precision
- Timezone-aware date comparisons using JavaScript Date objects
