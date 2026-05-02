const express = require('express');
const router = express.Router();
const { getAuthUserId, getUserRole } = require('../utils/authMiddleware');

const getPool = (req) => req.app.locals.db;

const mapBookingRow = (row) => ({
  id: row.id,
  propertyId: row.property_id,
  propertyTitle: row.property_title || null,
  guestId: row.guest_id,
  guestName: row.guest_name || null,
  hostId: row.host_id,
  hostName: row.host_name || null,
  checkIn: row.check_in,
  checkOut: row.check_out,
  checkInTime: row.check_in_time || '',
  checkOutTime: row.check_out_time || '',
  bookingType: row.booking_type,
  guests: row.guests,
  totalAmount: parseFloat(row.total_amount),
  status: row.status,
  paymentStatus: row.payment_status,
  specialRequests: row.special_requests || '',
  metadata: row.metadata || {},
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// GET /api/bookings - Get bookings (filtered by user role)
router.get('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    if (!role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, propertyId } = req.query;
    const where = [];
    const params = [];

    if (role === 'host') {
      where.push(`b.host_id = $${params.length + 1}`);
      params.push(userId);
    } else if (role === 'guest') {
      where.push(`b.guest_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (status) {
      where.push(`b.status = $${params.length + 1}`);
      params.push(status);
    }

    if (propertyId) {
      where.push(`b.property_id = $${params.length + 1}`);
      params.push(parseInt(propertyId, 10));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await pool.query(
      `
        SELECT
          b.*,
          p.title AS property_title,
          CONCAT_WS(' ', gu.first_name, gu.last_name) AS guest_name,
          CONCAT_WS(' ', ho.first_name, ho.last_name) AS host_name
        FROM bookings b
        JOIN properties p ON p.id = b.property_id
        LEFT JOIN users gu ON gu.id = b.guest_id
        LEFT JOIN users ho ON ho.id = b.host_id
        ${whereClause}
        ORDER BY b.created_at DESC
      `,
      params
    );

    const mapped = result.rows.map(mapBookingRow);
    return res.json({ bookings: mapped, total: mapped.length });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const bookingId = parseInt(req.params.id, 10);
    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    const result = await pool.query(
      `
        SELECT
          b.*,
          p.title AS property_title,
          CONCAT_WS(' ', gu.first_name, gu.last_name) AS guest_name,
          CONCAT_WS(' ', ho.first_name, ho.last_name) AS host_name
        FROM bookings b
        JOIN properties p ON p.id = b.property_id
        LEFT JOIN users gu ON gu.id = b.guest_id
        LEFT JOIN users ho ON ho.id = b.host_id
        WHERE b.id = $1
        LIMIT 1
      `,
      [bookingId]
    );

    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      role === 'guest' && row.guest_id !== userId
      || role === 'host' && row.host_id !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(mapBookingRow(row));
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// GET /api/bookings/availability/:propertyId - Check property availability
router.get('/availability/:propertyId', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    const { year, month } = req.query;
    const pool = getPool(req);

    if (!propertyId || Number.isNaN(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    // Default to current month if not provided
    const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month, 10) : new Date().getMonth();

    // Get first and last day of the month
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    // Get all bookings for this property in the specified month
    const result = await pool.query(
      `
        SELECT check_in, check_out, status
        FROM bookings
        WHERE property_id = $1
          AND status IN ('pending', 'confirmed')
          AND (
            (check_in >= $2 AND check_in <= $3)
            OR (check_out >= $2 AND check_out <= $3)
            OR (check_in <= $2 AND check_out >= $3)
          )
        ORDER BY check_in
      `,
      [propertyId, firstDay.toISOString(), lastDay.toISOString()]
    );

    // Create a map of unavailable dates
    const unavailableDates = {};
    
    result.rows.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      
      // Mark all dates between check-in and check-out as unavailable
      let currentDate = new Date(checkIn);
      while (currentDate <= checkOut) {
        const dateKey = currentDate.toISOString().split('T')[0];
        unavailableDates[dateKey] = true;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return res.json({
      year: targetYear,
      month: targetMonth,
      unavailableDates,
      bookings: result.rows.map(row => ({
        checkIn: row.check_in,
        checkOut: row.check_out,
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ message: 'Failed to check availability' });
  }
});

// GET /api/bookings/:id/cancellation-policy - Get cancellation policy for a booking
router.get('/:id/cancellation-policy', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const bookingId = parseInt(req.params.id, 10);
    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [bookingId]);
    const row = existing.rows[0];

    if (!row) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      role === 'guest' && row.guest_id !== userId
      || role === 'host' && row.host_id !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled
    if (row.status === 'cancelled') {
      return res.json({
        canCancel: false,
        reason: 'Booking is already cancelled'
      });
    }

    if (row.status === 'completed') {
      return res.json({
        canCancel: false,
        reason: 'Cannot cancel a completed booking'
      });
    }

    const checkInDate = new Date(row.check_in);
    const now = new Date();
    const hasStarted = now >= checkInDate;

    if (hasStarted) {
      return res.json({
        canCancel: false,
        reason: 'Cannot cancel a booking that has already started'
      });
    }

    // Calculate refund policy
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
    let refundPercentage = 0;
    let cancellationPolicy = 'No refund';

    if (hoursUntilCheckIn >= 48) {
      refundPercentage = 100;
      cancellationPolicy = 'Full refund (48+ hours notice)';
    } else if (hoursUntilCheckIn >= 24) {
      refundPercentage = 50;
      cancellationPolicy = '50% refund (24-48 hours notice)';
    } else {
      refundPercentage = 0;
      cancellationPolicy = 'No refund (less than 24 hours notice)';
    }

    // Get completed payments to calculate potential refund
    const paymentsResult = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 AND status = $2',
      [bookingId, 'completed']
    );

    const completedPayments = paymentsResult.rows;
    const totalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    // If no payments in payments table, use booking's total_amount if payment_status is paid
    const effectiveTotalPaid = totalPaid > 0 ? totalPaid : 
      (row.payment_status === 'paid' ? parseFloat(row.total_amount) : 0);
    
    const refundAmount = (effectiveTotalPaid * refundPercentage) / 100;

    return res.json({
      canCancel: true,
      policy: cancellationPolicy,
      refundPercentage,
      hoursUntilCheckIn: Math.round(hoursUntilCheckIn * 10) / 10,
      totalPaid: effectiveTotalPaid,
      refundAmount
    });
  } catch (error) {
    console.error('Error fetching cancellation policy:', error);
    return res.status(500).json({ message: 'Failed to fetch cancellation policy' });
  }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  try {
    const guestId = getAuthUserId(req);
    if (!guestId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);

    const role = await getUserRole(pool, guestId);
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
      metadata
    } = req.body;

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

    const propertyResult = await pool.query(
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
      return res.status(404).json({ message: 'Property is unavailable' });
    }

    const normalizedBookingType = ['fixed', 'hourly', 'both'].includes(bookingType) ? bookingType : 'fixed';
    const parsedExtraGuestFee = parseFloat(property.time_availability?.extraGuestFee);
    const extraGuestFeePerNight = Number.isFinite(parsedExtraGuestFee) && parsedExtraGuestFee > 0
      ? parsedExtraGuestFee
      : 0;
    const extraGuestCount = Math.max(0, parsedGuests - Number(property.max_guests || 0));

    if (extraGuestCount > 0 && normalizedBookingType !== 'fixed') {
      return res.status(400).json({ message: `This property supports up to ${property.max_guests} guests for hourly bookings` });
    }

    if (extraGuestCount > 0 && extraGuestFeePerNight <= 0) {
      return res.status(400).json({ message: `This property supports up to ${property.max_guests} guests` });
    }

    const overlapResult = await pool.query(
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
      return res.status(409).json({ message: 'Selected dates are no longer available' });
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

    const bookingMetadata = {
      ...(metadata || {}),
      extraGuestCount,
      extraGuestFeePerNight,
      extraGuestFeeTotal,
      includedGuests: property.max_guests
    };

    const insertResult = await pool.query(
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

    const newBooking = insertResult.rows[0];

    // Get property title and guest name for notification
    const propertyInfo = await pool.query(
      'SELECT title FROM properties WHERE id = $1',
      [parsedPropertyId]
    );
    const guestInfo = await pool.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [guestId]
    );

    const propertyTitle = propertyInfo.rows[0]?.title || 'Property';
    const guestName = `${guestInfo.rows[0]?.first_name || ''} ${guestInfo.rows[0]?.last_name || ''}`.trim() || 'Guest';

    // Create notification for host
    const notificationResult = await pool.query(
      `
        INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
        VALUES ($1, $2, $3, $4, false, NOW())
        RETURNING *
      `,
      [
        property.host_id,
        'booking',
        'New Booking Request',
        `${guestName} has requested to book ${propertyTitle} from ${checkInDate.toLocaleDateString()} to ${checkOutDate.toLocaleDateString()}`
      ]
    );

    // Send WebSocket notification to host
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

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: mapBookingRow(newBooking)
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const bookingId = parseInt(req.params.id, 10);
    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [bookingId]);
    const row = existing.rows[0];

    if (!row) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      role === 'guest' && row.guest_id !== userId
      || role === 'host' && row.host_id !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const nextStatus = req.body.status || row.status;
    const nextPaymentStatus = row.payment_status;
    const nextSpecialRequests = req.body.specialRequests !== undefined
      ? req.body.specialRequests
      : row.special_requests;

    const result = await pool.query(
      `
        UPDATE bookings
        SET
          status = $1,
          payment_status = $2,
          special_requests = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `,
      [nextStatus, nextPaymentStatus, nextSpecialRequests, bookingId]
    );

    const updatedBooking = result.rows[0];

    // Prepare response data and send immediately so notification errors won't affect client
    const responseData = mapBookingRow(updatedBooking);
    res.json({
      message: 'Booking updated successfully',
      booking: responseData
    });

    // Fire-and-forget: run notification + websocket logic asynchronously
    (async () => {
      if (nextStatus === row.status) return;
      try {
        // Get property and user info
        const propertyInfo = await pool.query(
          'SELECT title FROM properties WHERE id = $1',
          [row.property_id]
        );
        const propertyTitle = propertyInfo.rows[0]?.title || 'Property';

        // Notify guest about status change
        const guestNotification = await pool.query(
          `
            INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
            VALUES ($1, $2, $3, $4, false, NOW())
            RETURNING *
          `,
          [
            row.guest_id,
            'booking',
            'Booking Status Updated',
            `Your booking for ${propertyTitle} has been ${nextStatus}`
          ]
        );

        // Send WebSocket notification if available. Guard against websocket errors
        const websocket = req.app.locals.websocket;
        if (websocket && guestNotification.rows[0]) {
          try {
            const notification = guestNotification.rows[0];
            websocket.sendToUser(row.guest_id, 'notification', {
              id: notification.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              read: notification.is_read,
              timestamp: notification.created_at
            });

            websocket.sendToUser(row.guest_id, 'booking:notification', {
              bookingId: bookingId,
              status: nextStatus,
              propertyId: row.property_id
            });
          } catch (wsErr) {
            console.error('WebSocket send error (non-fatal):', wsErr);
          }
        }
      } catch (notifErr) {
        console.error('Notification handling error (non-fatal):', notifErr);
      }
    })();
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ message: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id - Cancel booking with refund logic
router.delete('/:id', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const bookingId = parseInt(req.params.id, 10);
    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [bookingId]);
    const row = existing.rows[0];

    if (!row) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      role === 'guest' && row.guest_id !== userId
      || role === 'host' && row.host_id !== userId
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent cancellation of already cancelled or completed bookings
    if (row.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (row.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Check if booking has already started
    const checkInDate = new Date(row.check_in);
    const now = new Date();
    const hasStarted = now >= checkInDate;

    if (hasStarted) {
      return res.status(400).json({ 
        message: 'Cannot cancel a booking that has already started',
        details: {
          checkInDate: checkInDate.toISOString(),
          currentDate: now.toISOString()
        }
      });
    }

    // Calculate refund based on cancellation policy
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
    let refundPercentage = 0;
    let cancellationPolicy = 'No refund';

    // Cancellation policy:
    // - 48+ hours before: 100% refund
    // - 24-48 hours before: 50% refund
    // - Less than 24 hours: No refund
    if (hoursUntilCheckIn >= 48) {
      refundPercentage = 100;
      cancellationPolicy = 'Full refund (48+ hours notice)';
    } else if (hoursUntilCheckIn >= 24) {
      refundPercentage = 50;
      cancellationPolicy = '50% refund (24-48 hours notice)';
    } else {
      refundPercentage = 0;
      cancellationPolicy = 'No refund (less than 24 hours notice)';
    }

    // Calculate refund amount based on completed payments
    const paymentsResult = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 AND status = $2',
      [bookingId, 'completed']
    );

    const completedPayments = paymentsResult.rows;
    const totalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    // If no payments in payments table, use booking's total_amount if payment_status is paid
    const effectiveTotalPaid = totalPaid > 0 ? totalPaid : 
      (row.payment_status === 'paid' ? parseFloat(row.total_amount) : 0);
    
    const refundAmount = (effectiveTotalPaid * refundPercentage) / 100;

    // Update booking status and store cancellation metadata
    const cancellationMetadata = {
      ...(row.metadata || {}),
      cancellation: {
        cancelledBy: role,
        cancelledAt: now.toISOString(),
        hoursBeforeCheckIn: Math.round(hoursUntilCheckIn * 10) / 10,
        policy: cancellationPolicy,
        refundPercentage,
        totalPaid: effectiveTotalPaid,
        refundAmount
      }
    };

    const result = await pool.query(
      `
        UPDATE bookings
        SET status = 'cancelled', metadata = $1::jsonb, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [JSON.stringify(cancellationMetadata), bookingId]
    );

    const cancelledBooking = result.rows[0];

    // Process refund if applicable
    if (refundAmount > 0) {
      // Update payment status to refunded for completed payments in payments table
      if (completedPayments.length > 0) {
        await pool.query(
          `
            UPDATE payments
            SET status = 'refunded'
            WHERE booking_id = $1 AND status = 'completed'
          `,
          [bookingId]
        );
      }

      // Update booking payment status to refunded
      await pool.query(
        `
          UPDATE bookings
          SET payment_status = 'refunded', updated_at = NOW()
          WHERE id = $1
        `,
        [bookingId]
      );
      
      // Refresh booking data to get updated payment_status
      const refreshedBooking = await pool.query(
        'SELECT * FROM bookings WHERE id = $1',
        [bookingId]
      );
      
      if (refreshedBooking.rows[0]) {
        Object.assign(cancelledBooking, refreshedBooking.rows[0]);
      }
    }

    // Send response immediately
    res.json({
      message: 'Booking cancelled successfully',
      booking: mapBookingRow(cancelledBooking),
      cancellation: {
        policy: cancellationPolicy,
        refundPercentage,
        refundAmount,
        totalPaid: effectiveTotalPaid
      }
    });

    // Fire-and-forget: Send notifications asynchronously
    (async () => {
      try {
        // Get property and user info
        const propertyInfo = await pool.query(
          'SELECT title FROM properties WHERE id = $1',
          [row.property_id]
        );
        const propertyTitle = propertyInfo.rows[0]?.title || 'Property';

        const guestInfo = await pool.query(
          'SELECT first_name, last_name FROM users WHERE id = $1',
          [row.guest_id]
        );
        const guestName = `${guestInfo.rows[0]?.first_name || ''} ${guestInfo.rows[0]?.last_name || ''}`.trim() || 'Guest';

        const hostInfo = await pool.query(
          'SELECT first_name, last_name FROM users WHERE id = $1',
          [row.host_id]
        );
        const hostName = `${hostInfo.rows[0]?.first_name || ''} ${hostInfo.rows[0]?.last_name || ''}`.trim() || 'Host';

        const checkInStr = new Date(row.check_in).toLocaleDateString();
        const checkOutStr = new Date(row.check_out).toLocaleDateString();

        // Notify the other party
        const recipientId = role === 'guest' ? row.host_id : row.guest_id;
        const recipientName = role === 'guest' ? hostName : guestName;
        const cancellerName = role === 'guest' ? guestName : hostName;

        let notificationMessage = `${cancellerName} has cancelled the booking for ${propertyTitle} (${checkInStr} - ${checkOutStr}).`;
        if (refundAmount > 0) {
          notificationMessage += ` Refund: ₱${refundAmount.toFixed(2)} (${refundPercentage}%)`;
        }

        const notification = await pool.query(
          `
            INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
            VALUES ($1, $2, $3, $4, false, NOW())
            RETURNING *
          `,
          [
            recipientId,
            'booking',
            'Booking Cancelled',
            notificationMessage
          ]
        );

        // Send WebSocket notification
        const websocket = req.app.locals.websocket;
        if (websocket && notification.rows[0]) {
          try {
            const notif = notification.rows[0];
            websocket.sendToUser(recipientId, 'notification', {
              id: notif.id,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              read: notif.is_read,
              timestamp: notif.created_at
            });

            websocket.sendToUser(recipientId, 'booking:notification', {
              bookingId: bookingId,
              status: 'cancelled',
              propertyId: row.property_id
            });
          } catch (wsErr) {
            console.error('WebSocket send error (non-fatal):', wsErr);
          }
        }
      } catch (notifErr) {
        console.error('Notification handling error (non-fatal):', notifErr);
      }
    })();
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

module.exports = router;