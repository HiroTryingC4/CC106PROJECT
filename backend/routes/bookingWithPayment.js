const express = require('express');
const router = express.Router();
const { getAuthUserId, getUserRole } = require('../utils/authMiddleware');
const { sendBookingConfirmation } = require('../utils/email');

const getPool = (req) => req.app.locals.db;

// POST /api/bookings/with-payment - Create booking with payment in single transaction
router.post('/', async (req, res) => {
  const client = await getPool(req).connect();
  
  try {
    const guestId = getAuthUserId(req);
    if (!guestId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const role = await getUserRole(getPool(req), guestId);
    if (role !== 'guest') {
      return res.status(403).json({ message: 'Only guests can create bookings' });
    }

    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      checkInTime,
      checkOutTime,
      bookingType,
      metadata,
      payment,
      promoCodeId
    } = req.body;

    // Validate required fields
    const parsedPropertyId = parseInt(propertyId, 10);
    const parsedGuests = parseInt(guests, 10);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (!parsedPropertyId || Number.isNaN(parsedPropertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    if (!parsedGuests || parsedGuests < 1) {
      return res.status(400).json({ message: 'Guest count must be at least 1' });
    }

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Invalid check-in/check-out dates' });
    }

    if (!payment || !payment.paymentMethod) {
      return res.status(400).json({ message: 'Payment information is required' });
    }

    // Start transaction
    await client.query('BEGIN');

    // Get property details
    const propertyResult = await client.query(
      `
        SELECT id, host_id, price_per_night, max_guests, availability, time_availability
        FROM properties
        WHERE id = $1
        LIMIT 1
      `,
      [parsedPropertyId]
    );

    const property = propertyResult.rows[0];
    if (!property || property.availability === false) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Property is unavailable' });
    }

    // Check for date conflicts
    const overlapResult = await client.query(
      `
        SELECT 1
        FROM bookings
        WHERE property_id = $1
          AND status IN ('pending', 'confirmed')
          AND ($2::timestamptz < check_out)
          AND ($3::timestamptz > check_in)
        LIMIT 1
      `,
      [parsedPropertyId, checkInDate.toISOString(), checkOutDate.toISOString()]
    );

    if (overlapResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Selected dates are no longer available' });
    }

    // Calculate amounts
    const normalizedBookingType = ['fixed', 'hourly', 'both'].includes(bookingType) ? bookingType : 'fixed';
    const parsedExtraGuestFee = parseFloat(property.time_availability?.extraGuestFee);
    const extraGuestFeePerNight = Number.isFinite(parsedExtraGuestFee) && parsedExtraGuestFee > 0
      ? parsedExtraGuestFee
      : 0;
    const extraGuestCount = Math.max(0, parsedGuests - Number(property.max_guests || 0));

    if (extraGuestCount > 0 && normalizedBookingType !== 'fixed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `This property supports up to ${property.max_guests} guests for hourly bookings` });
    }

    if (extraGuestCount > 0 && extraGuestFeePerNight <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `This property supports up to ${property.max_guests} guests` });
    }

    const oneDayMs = 1000 * 60 * 60 * 24;
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / oneDayMs));

    let totalAmount;
    let extraGuestFeeTotal = 0;
    if (normalizedBookingType === 'hourly') {
      const durationHours = parseInt(
        metadata?.durationHours || metadata?.selectedDuration?.hours,
        10
      );

      if (!Number.isFinite(durationHours) || durationHours < 1) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Duration hours are required for hourly bookings' });
      }

      const parsedHourlyRate = parseFloat(property.time_availability?.hourlyRate);
      const hourlyRate = Number.isFinite(parsedHourlyRate) && parsedHourlyRate > 0
        ? parsedHourlyRate
        : parseFloat(property.price_per_night) / 24;

      totalAmount = parseFloat((durationHours * hourlyRate).toFixed(2));
    } else {
      const baseTotal = nights * parseFloat(property.price_per_night);
      extraGuestFeeTotal = extraGuestCount > 0
        ? extraGuestCount * extraGuestFeePerNight * nights
        : 0;
      totalAmount = parseFloat((baseTotal + extraGuestFeeTotal).toFixed(2));
    }

    // Apply promo code discount if provided
    let discountAmount = 0;
    let appliedPromo = null;
    if (promoCodeId) {
      const promoResult = await client.query(
        `SELECT * FROM promo_codes WHERE id = $1 AND status = 'active'
         AND used_count < usage_limit AND NOW() BETWEEN start_date AND end_date`,
        [promoCodeId]
      );
      if (promoResult.rows.length > 0) {
        appliedPromo = promoResult.rows[0];
        discountAmount = appliedPromo.type === 'percentage'
          ? parseFloat(((totalAmount * parseFloat(appliedPromo.value)) / 100).toFixed(2))
          : Math.min(parseFloat(appliedPromo.value), totalAmount);
        totalAmount = parseFloat((totalAmount - discountAmount).toFixed(2));
      }
    }

    const bookingMetadata = {
      ...(metadata || {}),
      extraGuestCount,
      extraGuestFeePerNight,
      extraGuestFeeTotal,
      includedGuests: property.max_guests,
      ...(appliedPromo ? { promoCode: appliedPromo.code, discountAmount } : {})
    };

    // Create booking
    const bookingResult = await client.query(
      `
        INSERT INTO bookings (
          property_id,
          guest_id,
          host_id,
          check_in,
          check_out,
          check_in_time,
          check_out_time,
          booking_type,
          guests,
          total_amount,
          status,
          payment_status,
          special_requests,
          metadata,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'pending', $11, $12::jsonb, NOW(), NOW())
        RETURNING *
      `,
      [
        parsedPropertyId,
        guestId,
        property.host_id,
        checkInDate.toISOString(),
        checkOutDate.toISOString(),
        checkInTime || '',
        checkOutTime || '',
        normalizedBookingType,
        parsedGuests,
        totalAmount,
        specialRequests || '',
        JSON.stringify(bookingMetadata)
      ]
    );

    const newBooking = bookingResult.rows[0];

    // Validate payment amount
    const paymentAmount = parseFloat(payment.amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount < totalAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: `Full payment of ₱${totalAmount.toFixed(2)} is required` 
      });
    }

    // Create payment record
    const processingFee = parseFloat((paymentAmount * 0.03).toFixed(2));
    const hostPayout = parseFloat((paymentAmount - processingFee).toFixed(2));

    const paymentResult = await client.query(
      `
        INSERT INTO payments (
          booking_id,
          payer_user_id,
          host_id,
          amount,
          currency,
          status,
          payment_method,
          transaction_id,
          reference_number,
          processing_fee,
          host_payout,
          metadata,
          created_at
        )
        VALUES ($1, $2, $3, $4, 'PHP', $5, $6, $7, $8, $9, $10, $11::jsonb, NOW())
        RETURNING *
      `,
      [
        newBooking.id,
        guestId,
        property.host_id,
        paymentAmount,
        payment.status || 'pending',
        payment.paymentMethod,
        payment.transactionId || '',
        payment.referenceNumber || payment.transactionId || '',
        processingFee,
        hostPayout,
        JSON.stringify(payment.metadata || {})
      ]
    );

    const newPayment = paymentResult.rows[0];

    // Increment promo used_count
    if (appliedPromo) {
      await client.query(
        `UPDATE promo_codes SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1`,
        [appliedPromo.id]
      );
    }

    // Update booking payment status
    const bookingPaymentStatus = payment.status === 'completed' ? 'paid' : 'pending';
    await client.query(
      `UPDATE bookings SET payment_status = $1 WHERE id = $2`,
      [bookingPaymentStatus, newBooking.id]
    );

    // Get property and guest info for notifications
    const propertyInfo = await client.query(
      'SELECT title FROM properties WHERE id = $1',
      [parsedPropertyId]
    );
    const guestInfo = await client.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [guestId]
    );

    const propertyTitle = propertyInfo.rows[0]?.title || 'Property';
    const guestName = `${guestInfo.rows[0]?.first_name || ''} ${guestInfo.rows[0]?.last_name || ''}`.trim() || 'Guest';

    // Create notification for host
    const notificationResult = await client.query(
      `
        INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
        VALUES ($1, $2, $3, $4, false, NOW())
        RETURNING *
      `,
      [
        property.host_id,
        'booking',
        'New Booking Request',
        `${guestName} has booked ${propertyTitle} from ${checkInDate.toLocaleDateString()} to ${checkOutDate.toLocaleDateString()} with payment of ₱${paymentAmount.toFixed(2)}`
      ]
    );

    // Commit transaction
    await client.query('COMMIT');

    // Send WebSocket notifications (non-blocking)
    const websocket = req.app.locals.websocket;
    if (websocket) {
      const notification = notificationResult.rows[0];
      websocket.sendToUser(property.host_id, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.is_read,
        timestamp: notification.created_at
      });

      websocket.sendToUser(property.host_id, 'booking:notification', {
        bookingId: newBooking.id,
        status: 'pending',
        propertyId: parsedPropertyId,
        guestId: guestId
      });
    }

    // Send booking confirmation email to guest (non-blocking)
    (async () => {
      try {
        const hostInfo = await client.query(
          'SELECT first_name, last_name, email, phone FROM users WHERE id = $1',
          [property.host_id]
        );
        const host = hostInfo.rows[0];

        const propertyDetails = await client.query(
          'SELECT title, address FROM properties WHERE id = $1',
          [parsedPropertyId]
        );
        const prop = propertyDetails.rows[0];

        await sendBookingConfirmation({
          guestEmail: metadata?.email || guestInfo.rows[0]?.email,
          guestName: guestName,
          bookingId: newBooking.id,
          propertyTitle: prop?.title || propertyTitle,
          propertyAddress: prop?.address ? `${prop.address.street || ''}, ${prop.address.city || ''}, ${prop.address.state || ''}`.trim() : 'Address not available',
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          guests: parsedGuests,
          bookingType: normalizedBookingType,
          totalAmount: totalAmount,
          paidAmount: paymentAmount,
          remainingBalance: parseFloat((totalAmount - paymentAmount).toFixed(2)),
          paymentMethod: payment.paymentMethod,
          transactionId: newPayment.transaction_id,
          specialRequests: specialRequests || '',
          hostName: `${host?.first_name || ''} ${host?.last_name || ''}`.trim() || 'Host',
          hostEmail: host?.email || '',
          hostPhone: host?.phone || ''
        });
      } catch (emailError) {
        console.error('Error sending booking confirmation email (non-fatal):', emailError);
      }
    })();

    return res.status(201).json({
      message: 'Booking and payment created successfully',
      booking: {
        id: newBooking.id,
        propertyId: newBooking.property_id,
        guestId: newBooking.guest_id,
        hostId: newBooking.host_id,
        checkIn: newBooking.check_in,
        checkOut: newBooking.check_out,
        checkInTime: newBooking.check_in_time,
        checkOutTime: newBooking.check_out_time,
        bookingType: newBooking.booking_type,
        guests: newBooking.guests,
        totalAmount: parseFloat(newBooking.total_amount),
        status: newBooking.status,
        paymentStatus: bookingPaymentStatus,
        specialRequests: newBooking.special_requests,
        metadata: newBooking.metadata,
        createdAt: newBooking.created_at
      },
      payment: {
        id: newPayment.id,
        bookingId: newPayment.booking_id,
        amount: parseFloat(newPayment.amount),
        status: newPayment.status,
        paymentMethod: newPayment.payment_method,
        transactionId: newPayment.transaction_id,
        referenceNumber: newPayment.reference_number
      },
      remainingBalance: parseFloat((totalAmount - paymentAmount).toFixed(2))
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking with payment:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to create booking with payment' 
    });
  } finally {
    client.release();
  }
});

module.exports = router;
