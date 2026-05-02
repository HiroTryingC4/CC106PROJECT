const express = require('express');
const router = express.Router();
const { getAuthUserId, getUserRole } = require('../utils/authMiddleware');
const { 
  isPayMongoConfigured, 
  createPaymentIntent, 
  createPaymentMethod,
  attachPaymentIntent,
  createGCashSource,
  createPayMayaSource,
  retrieveSource,
  PAYMONGO_PUBLIC_KEY 
} = require('../utils/paymongo');

const getPool = (req) => req.app.locals.db;

const mapPaymentRow = (row) => ({
  id: row.id,
  bookingId: row.booking_id,
  payerUserId: row.payer_user_id,
  hostId: row.host_id,
  amount: parseFloat(row.amount),
  currency: row.currency,
  status: row.status,
  paymentMethod: row.payment_method,
  transactionId: row.transaction_id,
  referenceNumber: row.reference_number,
  processingFee: parseFloat(row.processing_fee),
  hostPayout: parseFloat(row.host_payout),
  guestName: row.guest_name || null,
  propertyTitle: row.property_title || null,
  bookingStatus: row.booking_status || null,
  bookingPaymentStatus: row.booking_payment_status || null,
  metadata: row.metadata || {},
  createdAt: row.created_at,
  completedAt: row.completed_at
});

const syncBookingPaymentStatus = async (pool, bookingId) => {
  const bookingResult = await pool.query(
    `
      SELECT id, total_amount
      FROM bookings
      WHERE id = $1
      LIMIT 1
    `,
    [bookingId]
  );

  const booking = bookingResult.rows[0];
  if (!booking) {
    return null;
  }

  const totalsResult = await pool.query(
    `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending_amount,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS completed_amount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) AS failed_amount,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) AS refunded_amount
      FROM payments
      WHERE booking_id = $1
    `,
    [bookingId]
  );

  const pendingAmount = parseFloat(totalsResult.rows[0]?.pending_amount || 0);
  const completedAmount = parseFloat(totalsResult.rows[0]?.completed_amount || 0);
  const failedAmount = parseFloat(totalsResult.rows[0]?.failed_amount || 0);
  const refundedAmount = parseFloat(totalsResult.rows[0]?.refunded_amount || 0);
  const bookingTotal = parseFloat(booking.total_amount || 0);

  let bookingPaymentStatus = 'pending';
  if (completedAmount >= bookingTotal && bookingTotal > 0) {
    bookingPaymentStatus = 'paid';
  } else if (pendingAmount > 0) {
    bookingPaymentStatus = 'pending';
  } else if (completedAmount > 0) {
    bookingPaymentStatus = 'partial';
  } else if (failedAmount > 0) {
    bookingPaymentStatus = 'failed';
  } else if (refundedAmount > 0) {
    bookingPaymentStatus = 'refunded';
  }

  await pool.query(
    `
      UPDATE bookings
      SET payment_status = $2, updated_at = NOW()
      WHERE id = $1
    `,
    [bookingId, bookingPaymentStatus]
  );

  return {
    bookingTotal,
    pendingAmount,
    completedAmount,
    failedAmount,
    refundedAmount,
    bookingPaymentStatus,
    remainingAmount: Math.max(0, parseFloat((bookingTotal - pendingAmount - completedAmount).toFixed(2)))
  };
};

// GET /api/payments/retrieve-metadata - Retrieve booking data from PayMongo source/payment metadata
router.get('/retrieve-metadata', async (req, res) => {
  try {
    const { sourceId, paymentIntentId } = req.query;
    
    if (!sourceId && !paymentIntentId) {
      return res.status(400).json({ message: 'Source ID or Payment Intent ID required' });
    }

    let metadata = {};
    
    try {
      if (sourceId) {
        const source = await retrieveSource(sourceId);
        metadata = source.attributes.metadata || {};
      } else if (paymentIntentId) {
        const paymentIntent = await retrievePaymentIntent(paymentIntentId);
        metadata = paymentIntent.attributes.metadata || {};
      }
    } catch (error) {
      console.error('Error retrieving PayMongo data:', error);
      return res.status(500).json({ message: 'Failed to retrieve payment information' });
    }

    // Extract and parse booking data from metadata
    const bookingDataStr = metadata.bookingData;
    if (!bookingDataStr) {
      return res.status(404).json({ message: 'Booking data not found in payment metadata' });
    }

    try {
      const bookingData = JSON.parse(bookingDataStr);
      return res.json({ bookingData });
    } catch (parseError) {
      console.error('Error parsing booking data:', parseError);
      return res.status(500).json({ message: 'Invalid booking data format' });
    }
  } catch (error) {
    console.error('Error in retrieve-metadata:', error);
    return res.status(500).json({ message: 'Failed to retrieve metadata' });
  }
});

// GET /api/payments/config - Get payment configuration
router.get('/config', (req, res) => {
  try {
    return res.json({
      paymongoConfigured: isPayMongoConfigured(),
      publicKey: PAYMONGO_PUBLIC_KEY || null,
      supportedMethods: ['gcash', 'paymaya', 'card']
    });
  } catch (error) {
    console.error('Error fetching payment config:', error);
    return res.status(500).json({ message: 'Failed to fetch payment configuration' });
  }
});

// POST /api/payments/create-intent - Create PayMongo payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const { bookingId, amount, description } = req.body;
    const parsedBookingId = parseInt(bookingId, 10);
    const parsedAmount = parseFloat(amount);

    if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const pool = getPool(req);
    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [parsedBookingId]);
    const booking = bookingResult.rows[0];
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create PayMongo payment intent
    const paymentIntent = await createPaymentIntent({
      amount: parsedAmount,
      currency: 'PHP',
      description: description || `Payment for Booking #${parsedBookingId}`,
      metadata: {
        bookingId: parsedBookingId,
        userId,
        hostId: booking.host_id
      }
    });

    return res.json({
      clientKey: paymentIntent.attributes.client_key,
      paymentIntentId: paymentIntent.id,
      amount: parsedAmount,
      status: paymentIntent.attributes.status
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: error.message || 'Failed to create payment intent' });
  }
});

// POST /api/payments/create-card-payment - Create and attach a PayMongo card payment
router.post('/create-card-payment', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const {
      bookingId,
      amount,
      cardNumber,
      expMonth,
      expYear,
      cvc,
      billing,
      description,
      metadata: reqMetadata = {}
    } = req.body;

    const parsedBookingId = parseInt(bookingId, 10);
    const parsedAmount = parseFloat(amount);

    if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (!cardNumber || !expMonth || !expYear || !cvc) {
      return res.status(400).json({ message: 'Card details are required' });
    }

    const pool = getPool(req);
    let booking = null;
    let hostId = userId;

    if (parsedBookingId < 900000) {
      const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [parsedBookingId]);
      booking = bookingResult.rows[0];

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.guest_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      hostId = booking.host_id;
    }

    const paymentIntent = await createPaymentIntent({
      amount: parsedAmount,
      currency: 'PHP',
      description: description || `Payment for Booking #${parsedBookingId}`,
      metadata: {
        bookingId: parsedBookingId,
        userId,
        hostId,
        paymentMethod: 'card',
        pendingId: reqMetadata.pendingId || ''
      }
    });

    console.log('Sending to PayMongo:', {
      card_number: String(cardNumber).replace(/\D/g, ''),
      exp_month: parseInt(expMonth, 10),
      exp_year: parseInt(expYear, 10),
      cvc: String(cvc)
    });
    const paymentMethod = await createPaymentMethod({
      type: 'card',
      details: {
        card_number: String(cardNumber).replace(/\D/g, ''),
        exp_month: parseInt(expMonth, 10),
        exp_year: parseInt(expYear, 10),
        cvc: String(cvc)
      }
    });
    console.log('Card details sent:', { card_number: String(cardNumber).replace(/\s+/g, ''), exp_month: parseInt(expMonth, 10), exp_year: parseInt(expYear, 10) });

    const attachedIntent = await attachPaymentIntent(
      paymentIntent.id,
      paymentMethod.id,
      paymentIntent.attributes.client_key
    );

    const paymentStatus = attachedIntent.attributes.status;

    await pool.query(
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
        VALUES ($1, $2, $3, $4, 'PHP', $5, 'card', $6, $6, $7, $8, $9::jsonb, NOW())
      `,
      [
        parsedBookingId,
        userId,
        hostId,
        parsedAmount,
        paymentStatus === 'succeeded' ? 'completed' : 'pending',
        attachedIntent.id,
        parseFloat((parsedAmount * 0.03).toFixed(2)),
        parseFloat((parsedAmount * 0.97).toFixed(2)),
        JSON.stringify({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentMethod.id,
          paymentMethod: 'card',
          status: paymentStatus
        })
      ]
    );

    return res.json({
      paymentIntentId: paymentIntent.id,
      paymentMethodId: paymentMethod.id,
      status: paymentStatus,
      clientKey: paymentIntent.attributes.client_key,
      amount: parsedAmount
    });
  } catch (error) {
    console.error('Error creating card payment:', error);
    return res.status(500).json({ message: error.message || 'Failed to create card payment' });
  }
});

// POST /api/payments/create-source - Create PayMongo payment source (GCash/PayMaya)
router.post('/create-source', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const { bookingId, amount, paymentMethod, billing } = req.body;
    const parsedBookingId = parseInt(bookingId, 10);
    const parsedAmount = parseFloat(amount);
    const metadata = req.body.metadata || {};

    if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (!['gcash', 'paymaya', 'grab_pay'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Use gcash, paymaya, or grab_pay' });
    }

    const pool = getPool(req);
    
    // For temporary/test bookings (ID >= 900000), skip booking validation
    // This allows payment flow to work before booking is created
    let booking = null;
    let hostId = userId;
    
    if (parsedBookingId < 900000) {
      const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [parsedBookingId]);
      booking = bookingResult.rows[0];
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.guest_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      hostId = booking.host_id;
    }

    // Create payment source
    let source;
    const description = `SmartStay ${booking ? `Booking #${parsedBookingId}` : 'Payment'}`;
    
    // Map paymaya to grab_pay for PayMongo API
    const actualPaymentMethod = paymentMethod === 'paymaya' ? 'grab_pay' : paymentMethod;
    
    if (actualPaymentMethod === 'gcash') {
      source = await createGCashSource({ amount: parsedAmount, description, billing, bookingId: parsedBookingId, paymentMethod: actualPaymentMethod, metadata });
    } else {
      source = await createPayMayaSource({ amount: parsedAmount, description, billing, bookingId: parsedBookingId, paymentMethod: actualPaymentMethod, metadata });
    }

    console.log('Created PayMongo source:', source.id);
    console.log('Source metadata:', source.attributes.metadata);
    console.log('Checkout URL:', source.attributes.redirect.checkout_url);

    // Construct a custom checkout URL that includes the source ID
    const checkoutUrl = source.attributes.redirect.checkout_url;
    const successUrl = source.attributes.redirect.success;
    const modifiedSuccessUrl = `${successUrl}?sourceId=${source.id}`;

    // For temporary bookings, don't store payment record yet
    // It will be created when booking is finalized
    if (parsedBookingId < 900000) {
      await pool.query(
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
          VALUES ($1, $2, $3, $4, 'PHP', 'pending', $5, $6, $6, $7, $8, $9::jsonb, NOW())
        `,
        [
          parsedBookingId,
          userId,
          hostId,
          parsedAmount,
          paymentMethod,
          source.id,
          parseFloat((parsedAmount * 0.03).toFixed(2)),
          parseFloat((parsedAmount * 0.97).toFixed(2)),
          JSON.stringify({ sourceId: source.id, paymentMethod, isTest: parsedBookingId >= 900000 })
        ]
      );
    }

    return res.json({
      sourceId: source.id,
      checkoutUrl: source.attributes.redirect.checkout_url,
      status: source.attributes.status
    });
  } catch (error) {
    console.error('Error creating payment source:', error);
    return res.status(500).json({ message: error.message || 'Failed to create payment source' });
  }
});

// POST /api/payments/webhook - PayMongo webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body.data;
    
    if (!event) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    const eventType = event.attributes.type;
    const pool = getPool(req);

    // Handle source.chargeable event (GCash/PayMaya)
    if (eventType === 'source.chargeable') {
      const sourceId = event.attributes.data.id;
      
      // Find payment by source ID
      const paymentResult = await pool.query(
        `SELECT * FROM payments WHERE transaction_id = $1 LIMIT 1`,
        [sourceId]
      );

      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        
        // Update payment status to completed
        await pool.query(
          `UPDATE payments SET status = 'completed', completed_at = NOW() WHERE id = $1`,
          [payment.id]
        );

        // Sync booking payment status
        await syncBookingPaymentStatus(pool, payment.booking_id);

        // Send notification to guest
        const bookingInfo = await pool.query(
          `SELECT b.guest_id, p.title FROM bookings b JOIN properties p ON p.id = b.property_id WHERE b.id = $1`,
          [payment.booking_id]
        );

        if (bookingInfo.rows[0]) {
          await pool.query(
            `INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
             VALUES ($1, 'payment', 'Payment Successful', $2, false, NOW())`,
            [
              bookingInfo.rows[0].guest_id,
              `Your payment of ₱${parseFloat(payment.amount).toFixed(2)} for ${bookingInfo.rows[0].title} was successful`
            ]
          );
        }
      }
    }

    // Handle payment.paid event
    if (eventType === 'payment.paid') {
      const paymentIntentId = event.attributes.data.attributes.payment_intent_id;
      
      // Find payment by payment intent ID in metadata
      const paymentResult = await pool.query(
        `SELECT * FROM payments WHERE metadata->>'paymentIntentId' = $1 LIMIT 1`,
        [paymentIntentId]
      );

      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        
        await pool.query(
          `UPDATE payments SET status = 'completed', completed_at = NOW() WHERE id = $1`,
          [payment.id]
        );

        await syncBookingPaymentStatus(pool, payment.booking_id);
      }
    }

    // Handle payment.failed event
    if (eventType === 'payment.failed') {
      const paymentIntentId = event.attributes.data.attributes.payment_intent_id;
      
      const paymentResult = await pool.query(
        `SELECT * FROM payments WHERE metadata->>'paymentIntentId' = $1 LIMIT 1`,
        [paymentIntentId]
      );

      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        
        await pool.query(
          `UPDATE payments SET status = 'failed' WHERE id = $1`,
          [payment.id]
        );

        await syncBookingPaymentStatus(pool, payment.booking_id);
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// GET /api/payments - Get payments
router.get('/', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    const { status, bookingId } = req.query;

    const where = [];
    const params = [];

    if (role === 'host') {
      where.push(`p.host_id = $${params.length + 1}`);
      params.push(userId);
    } else if (role === 'guest') {
      where.push(`p.payer_user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (status) {
      where.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }

    if (bookingId) {
      where.push(`p.booking_id = $${params.length + 1}`);
      params.push(parseInt(bookingId, 10));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await pool.query(
      `
        SELECT
          p.*,
          CONCAT_WS(' ', gu.first_name, gu.last_name) AS guest_name,
          pr.title AS property_title,
          b.status AS booking_status,
          b.payment_status AS booking_payment_status
        FROM payments p
        LEFT JOIN bookings b ON b.id = p.booking_id
        LEFT JOIN users gu ON gu.id = p.payer_user_id
        LEFT JOIN properties pr ON pr.id = b.property_id
        ${whereClause}
        ORDER BY p.created_at DESC
      `,
      params
    );

    const mapped = result.rows.map(mapPaymentRow);
    return res.json({ payments: mapped, total: mapped.length });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

// GET /api/payments/payouts - Get payouts for host (or all for admin)
router.get('/payouts', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);
    const role = await getUserRole(pool, userId);

    if (role !== 'host' && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let result;
    if (role === 'admin') {
      // Admin sees all payouts with host info
      result = await pool.query(
        `
          SELECT
            p.*,
            CONCAT_WS(' ', u.first_name, u.last_name) AS host_name,
            u.email AS host_email,
            CONCAT_WS(' ', a.first_name, a.last_name) AS approved_by_name
          FROM payouts p
          JOIN users u ON u.id = p.host_id
          LEFT JOIN users a ON a.id = p.approved_by
          ORDER BY p.created_at DESC
        `
      );
    } else {
      // Host sees only their own payouts
      result = await pool.query(
        `
          SELECT
            p.*,
            CONCAT_WS(' ', a.first_name, a.last_name) AS approved_by_name
          FROM payouts p
          LEFT JOIN users a ON a.id = p.approved_by
          WHERE p.host_id = $1
          ORDER BY p.created_at DESC
        `,
        [userId]
      );
    }

    const payouts = result.rows.map((row) => ({
      id: row.id,
      hostId: row.host_id,
      hostName: row.host_name || null,
      hostEmail: row.host_email || null,
      amount: parseFloat(row.amount || 0),
      currency: row.currency,
      status: row.status,
      payoutMethod: row.payout_method,
      notes: row.notes || '',
      approvedBy: row.approved_by || null,
      approvedByName: row.approved_by_name || null,
      approvedAt: row.approved_at || null,
      rejectionReason: row.rejection_reason || '',
      createdAt: row.created_at,
      completedAt: row.completed_at || null
    }));

    return res.json({ payouts, total: payouts.length });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return res.status(500).json({ message: 'Failed to fetch payouts' });
  }
});

// GET /api/payments/earnings - Get earnings summary for host
router.get('/earnings', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    if (role !== 'host') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totals = await pool.query(
      `
        SELECT
          COALESCE(SUM(CASE WHEN status = 'completed' THEN host_payout ELSE 0 END), 0) AS total_earnings,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN processing_fee ELSE 0 END), 0) AS total_fees,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN host_payout ELSE 0 END), 0) AS pending_earnings
        FROM payments
        WHERE host_id = $1
      `,
      [userId]
    );

    const row = totals.rows[0];
    return res.json({
      totalEarnings: parseFloat(row.total_earnings || 0),
      totalFees: parseFloat(row.total_fees || 0),
      pendingEarnings: parseFloat(row.pending_earnings || 0),
      availableBalance: parseFloat(row.total_earnings || 0),
      totalPaidOut: 0,
      monthlyEarnings: []
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return res.status(500).json({ message: 'Failed to fetch earnings' });
  }
});

const createPayment = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);

    const {
      bookingId,
      amount,
      currency = 'PHP',
      paymentMethod,
      transactionId,
      referenceNumber,
      metadata
    } = req.body;

    const parsedBookingId = parseInt(bookingId, 10);
    const parsedAmount = parseFloat(amount);

    if (!parsedBookingId || Number.isNaN(parsedBookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [parsedBookingId]);
    const booking = bookingResult.rows[0];
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.guest_id !== userId) {
      return res.status(403).json({ message: 'Only the booking guest can submit payment' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });
    }

    const currentPaidResult = await pool.query(
      `
        SELECT
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending_amount,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS completed_amount,
          COALESCE(SUM(CASE WHEN status IN ('pending', 'completed') THEN amount ELSE 0 END), 0) AS paid_amount
        FROM payments
        WHERE booking_id = $1
      `,
      [parsedBookingId]
    );

    const pendingAmount = parseFloat(currentPaidResult.rows[0]?.pending_amount || 0);
    const completedAmount = parseFloat(currentPaidResult.rows[0]?.completed_amount || 0);
    const alreadyPaid = parseFloat(currentPaidResult.rows[0]?.paid_amount || 0);
    const bookingTotal = parseFloat(booking.total_amount || 0);
    const remainingAmount = parseFloat((bookingTotal - alreadyPaid).toFixed(2));

    if (remainingAmount <= 0) {
      if (completedAmount >= bookingTotal) {
        return res.status(400).json({ message: 'This booking is already fully paid' });
      }

      if (pendingAmount > 0) {
        return res.status(400).json({
          message: 'A payment for this booking is already pending confirmation'
        });
      }

      return res.status(400).json({ message: 'This booking is already fully paid' });
    }

    if (parsedAmount > remainingAmount) {
      return res.status(400).json({ message: `Payment exceeds remaining balance of ${remainingAmount.toFixed(2)}` });
    }

    const processingFee = parseFloat((parsedAmount * 0.03).toFixed(2));
    const hostPayout = parseFloat((parsedAmount - processingFee).toFixed(2));

    const paymentResult = await pool.query(
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
        VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10, $11::jsonb, NOW())
        RETURNING *
      `,
      [
        parsedBookingId,
        userId,
        booking.host_id,
        parsedAmount,
        currency,
        paymentMethod || 'gcash',
        transactionId || '',
        referenceNumber || transactionId || '',
        processingFee,
        hostPayout,
        JSON.stringify(metadata || {})
      ]
    );

    const bookingTotals = await syncBookingPaymentStatus(pool, parsedBookingId);

    return res.status(201).json({
      message: 'Payment submitted successfully',
      payment: mapPaymentRow(paymentResult.rows[0]),
      remainingBalance: bookingTotals
        ? bookingTotals.remainingAmount
        : parseFloat((remainingAmount - parsedAmount).toFixed(2))
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ message: 'Failed to process payment' });
  }
};

// POST /api/payments - Process payment
router.post('/', createPayment);

// POST /api/payments/process - Backward-compatible payment endpoint
router.post('/process', createPayment);

const updatePaymentStatus = async (req, res, forcedStatus = null) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const paymentId = parseInt(req.params.id, 10);
    if (!paymentId || Number.isNaN(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID' });
    }

    const nextStatus = String(forcedStatus || req.body.status || '').toLowerCase();
    if (!['completed', 'failed', 'refunded'].includes(nextStatus)) {
      return res.status(400).json({ message: 'Invalid target payment status' });
    }

    const pool = getPool(req);

    const role = await getUserRole(pool, userId);
    if (!['host', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Only host/admin can update payment status' });
    }

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1 LIMIT 1', [paymentId]);
    const payment = paymentResult.rows[0];
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (role === 'host' && payment.host_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending payments can be reviewed' });
    }

    const updatedPaymentResult = await pool.query(
      `
        UPDATE payments
        SET
          status = $2
        WHERE id = $1
        RETURNING *
      `,
      [paymentId, nextStatus]
    );

    const updatedPayment = updatedPaymentResult.rows[0];
    const bookingTotals = await syncBookingPaymentStatus(pool, payment.booking_id);

    // Get booking and property info for notification
    const bookingInfo = await pool.query(
      `
        SELECT b.guest_id, b.property_id, p.title as property_title
        FROM bookings b
        JOIN properties p ON p.id = b.property_id
        WHERE b.id = $1
      `,
      [payment.booking_id]
    );

    const booking = bookingInfo.rows[0];
    if (booking) {
      // Create notification for guest
      let notificationTitle = '';
      let notificationMessage = '';

      if (nextStatus === 'completed') {
        notificationTitle = 'Payment Approved';
        notificationMessage = `Your payment of ₱${parseFloat(payment.amount).toFixed(2)} for ${booking.property_title} has been approved`;
      } else if (nextStatus === 'failed') {
        notificationTitle = 'Payment Rejected';
        notificationMessage = `Your payment of ₱${parseFloat(payment.amount).toFixed(2)} for ${booking.property_title} has been rejected. Please contact the host.`;
      } else if (nextStatus === 'refunded') {
        notificationTitle = 'Payment Refunded';
        notificationMessage = `Your payment of ₱${parseFloat(payment.amount).toFixed(2)} for ${booking.property_title} has been refunded`;
      }

      if (notificationTitle) {
        const notificationResult = await pool.query(
          `
            INSERT INTO user_notifications (user_id, type, title, message, is_read, created_at)
            VALUES ($1, $2, $3, $4, false, NOW())
            RETURNING *
          `,
          [booking.guest_id, 'payment', notificationTitle, notificationMessage]
        );

        // Send WebSocket notification
        const websocket = req.app.locals.websocket;
        if (websocket) {
          const notification = notificationResult.rows[0];
          websocket.sendToUser(booking.guest_id, 'notification', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: notification.is_read,
            timestamp: notification.created_at
          });
        }
      }
    }

    return res.json({
      message: `Payment marked as ${nextStatus}`,
      payment: mapPaymentRow(updatedPayment),
      bookingPaymentStatus: bookingTotals?.bookingPaymentStatus || null,
      remainingBalance: bookingTotals?.remainingAmount ?? null
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ message: 'Failed to update payment status' });
  }
};

// PUT /api/payments/:id/status - Host/admin payment review
router.put('/:id/status', (req, res) => updatePaymentStatus(req, res));

// PUT /api/payments/:id/approve - Convenience route for approval
router.put('/:id/approve', (req, res) => updatePaymentStatus(req, res, 'completed'));

// PUT /api/payments/:id/reject - Convenience route for rejection
router.put('/:id/reject', (req, res) => updatePaymentStatus(req, res, 'failed'));

// POST /api/payments/payouts - Host requests a payout (saved to DB)
router.post('/payouts', async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);
    const role = await getUserRole(pool, userId);
    if (role !== 'host') {
      return res.status(403).json({ message: 'Only hosts can request payouts' });
    }

    const { amount, currency = 'PHP', payoutMethod = 'bank_transfer', notes = '' } = req.body;
    const parsedAmount = parseFloat(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payout amount' });
    }

    // Prevent duplicate pending payout requests
    const existing = await pool.query(
      `SELECT id FROM payouts WHERE host_id = $1 AND status = 'pending' LIMIT 1`,
      [userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'You already have a pending payout request' });
    }

    const result = await pool.query(
      `
        INSERT INTO payouts (host_id, amount, currency, status, payout_method, notes, created_at)
        VALUES ($1, $2, $3, 'pending', $4, $5, NOW())
        RETURNING *
      `,
      [userId, parsedAmount, currency, payoutMethod, notes]
    );

    const row = result.rows[0];
    return res.status(201).json({
      message: 'Payout request submitted successfully',
      payout: {
        id: row.id,
        hostId: row.host_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        payoutMethod: row.payout_method,
        notes: row.notes,
        createdAt: row.created_at,
        completedAt: row.completed_at
      }
    });
  } catch (error) {
    console.error('Error creating payout request:', error);
    return res.status(500).json({ message: 'Failed to submit payout request' });
  }
});

// PATCH /api/payments/payouts/:id/approve - Admin approves a payout
router.patch('/payouts/:id/approve', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);
    const role = await getUserRole(pool, adminId);
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve payouts' });
    }

    const payoutId = parseInt(req.params.id, 10);
    if (Number.isNaN(payoutId)) {
      return res.status(400).json({ message: 'Invalid payout ID' });
    }

    const existing = await pool.query(
      `SELECT * FROM payouts WHERE id = $1 LIMIT 1`,
      [payoutId]
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Payout not found' });
    }
    if (existing.rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending payouts can be approved' });
    }

    const result = await pool.query(
      `
        UPDATE payouts
        SET status = 'approved', approved_by = $2, approved_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [payoutId, adminId]
    );

    const row = result.rows[0];
    return res.json({
      message: 'Payout approved',
      payout: {
        id: row.id,
        hostId: row.host_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        approvedBy: row.approved_by,
        approvedAt: row.approved_at,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    return res.status(500).json({ message: 'Failed to approve payout' });
  }
});

// PATCH /api/payments/payouts/:id/reject - Admin rejects a payout
router.patch('/payouts/:id/reject', async (req, res) => {
  try {
    const adminId = getAuthUserId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const pool = getPool(req);
    const role = await getUserRole(pool, adminId);
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject payouts' });
    }

    const payoutId = parseInt(req.params.id, 10);
    if (Number.isNaN(payoutId)) {
      return res.status(400).json({ message: 'Invalid payout ID' });
    }

    const { rejectionReason = '' } = req.body;

    const existing = await pool.query(
      `SELECT * FROM payouts WHERE id = $1 LIMIT 1`,
      [payoutId]
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ message: 'Payout not found' });
    }
    if (existing.rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending payouts can be rejected' });
    }

    const result = await pool.query(
      `
        UPDATE payouts
        SET status = 'rejected', approved_by = $2, approved_at = NOW(), rejection_reason = $3
        WHERE id = $1
        RETURNING *
      `,
      [payoutId, adminId, rejectionReason]
    );

    const row = result.rows[0];
    return res.json({
      message: 'Payout rejected',
      payout: {
        id: row.id,
        hostId: row.host_id,
        amount: parseFloat(row.amount),
        status: row.status,
        rejectionReason: row.rejection_reason,
        approvedBy: row.approved_by,
        approvedAt: row.approved_at,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    return res.status(500).json({ message: 'Failed to reject payout' });
  }
});

module.exports = router;