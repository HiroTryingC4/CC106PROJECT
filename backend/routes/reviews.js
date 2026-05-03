const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

const mapPropertyReviewRow = (row) => {
  let checkoutPhotos = [];
  if (row.checkout_photos) {
    // PostgreSQL returns JSON as an object/array directly when using ->
    if (Array.isArray(row.checkout_photos)) {
      checkoutPhotos = row.checkout_photos;
    } else if (typeof row.checkout_photos === 'string') {
      try {
        checkoutPhotos = JSON.parse(row.checkout_photos);
      } catch (e) {
        checkoutPhotos = [];
      }
    }
  }
  
  return {
    id: row.id,
    propertyId: row.property_id,
    bookingId: row.booking_id,
    guestId: row.guest_id,
    hostId: row.host_id,
    rating: row.rating,
    comment: row.comment,
    cleanliness: row.cleanliness,
    accuracy: row.accuracy,
    communication: row.communication,
    location: row.location,
    checkIn: row.check_in,
    value: row.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    checkoutPhotos,
    guestName: row.guest_name || null,
    hostReply: row.host_reply || null,
    hostReplyDate: row.host_reply_date || null
  };
};

const mapHostReviewRow = (row) => ({
  id: row.id,
  hostId: row.host_id,
  guestId: row.guest_id,
  bookingId: row.booking_id,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at
});

// GET /api/reviews - Get reviews
router.get('/', async (req, res) => {
  try {
    const { propertyId, hostId, guestId, bookingId } = req.query;
    const db = req.app.locals.db;

    const where = [];
    const params = [];

    if (propertyId) {
      where.push(`pr.property_id = $${params.length + 1}`);
      params.push(parseInt(propertyId, 10));
    }

    if (hostId) {
      where.push(`pr.host_id = $${params.length + 1}`);
      params.push(parseInt(hostId, 10));
    }

    if (guestId) {
      where.push(`pr.guest_id = $${params.length + 1}`);
      params.push(parseInt(guestId, 10));
    }

    if (bookingId) {
      where.push(`pr.booking_id = $${params.length + 1}`);
      params.push(parseInt(bookingId, 10));
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await db.query(
      `
        SELECT
          pr.id,
          pr.property_id,
          pr.booking_id,
          pr.guest_id,
          pr.host_id,
          pr.rating,
          pr.comment,
          pr.cleanliness,
          pr.accuracy,
          pr.communication,
          pr.location,
          pr.check_in,
          pr.value,
          pr.created_at,
          pr.updated_at,
          pr.host_reply,
          pr.host_reply_date,
          b.metadata->'checkoutPhotos' AS checkout_photos,
          CONCAT(u.first_name, ' ', u.last_name) AS guest_name
        FROM property_reviews pr
        LEFT JOIN bookings b ON pr.booking_id = b.id
        LEFT JOIN users u ON pr.guest_id = u.id
        ${whereClause}
        ORDER BY pr.created_at DESC
      `,
      params
    );

    const reviews = result.rows.map(mapPropertyReviewRow);
    return res.json({ reviews, total: reviews.length });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/host/:hostId - Get host reviews
router.get('/host/:hostId', async (req, res) => {
  try {
    const hostId = parseInt(req.params.hostId, 10);
    if (Number.isNaN(hostId)) {
      return res.status(400).json({ message: 'Invalid host id' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        SELECT id, host_id, guest_id, booking_id, rating, comment, created_at
        FROM host_reviews
        WHERE host_id = $1
        ORDER BY created_at DESC
      `,
      [hostId]
    );

    const reviews = result.rows.map(mapHostReviewRow);
    return res.json({ reviews, total: reviews.length });
  } catch (error) {
    console.error('Error fetching host reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch host reviews' });
  }
});

// GET /api/reviews/debug/:propertyId - Debug endpoint (must be before /property/:propertyId)
router.get('/debug/:propertyId', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    const db = req.app.locals.db;

    const reviews = await db.query(
      `SELECT 
        pr.id,
        pr.booking_id,
        pr.rating,
        pr.comment,
        b.metadata,
        b.metadata->'checkoutPhotos' as checkout_photos_json,
        b.metadata->>'checkoutPhotos' as checkout_photos_text
      FROM property_reviews pr
      LEFT JOIN bookings b ON pr.booking_id = b.id
      WHERE pr.property_id = $1`,
      [propertyId]
    );

    return res.json({
      message: 'Debug data',
      reviews: reviews.rows
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/property/:propertyId - Get property reviews
router.get('/property/:propertyId', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    if (Number.isNaN(propertyId)) {
      return res.status(400).json({ message: 'Invalid property id' });
    }

    const db = req.app.locals.db;
    const result = await db.query(
      `
        SELECT
          pr.id,
          pr.property_id,
          pr.booking_id,
          pr.guest_id,
          pr.host_id,
          pr.rating,
          pr.comment,
          pr.cleanliness,
          pr.accuracy,
          pr.communication,
          pr.location,
          pr.check_in,
          pr.value,
          pr.created_at,
          pr.updated_at,
          pr.host_reply,
          pr.host_reply_date,
          b.metadata->'checkoutPhotos' AS checkout_photos,
          CONCAT(u.first_name, ' ', u.last_name) AS guest_name
        FROM property_reviews pr
        LEFT JOIN bookings b ON pr.booking_id = b.id
        LEFT JOIN users u ON pr.guest_id = u.id
        WHERE pr.property_id = $1
        ORDER BY pr.created_at DESC
      `,
      [propertyId]
    );

    const reviews = result.rows.map(mapPropertyReviewRow);
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return res.json({
        reviews: [],
        total: 0,
        averageRating: 0,
        ratingBreakdown: {
          cleanliness: 0,
          accuracy: 0,
          communication: 0,
          location: 0,
          checkIn: 0,
          value: 0
        }
      });
    }

    const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews;
    const ratingBreakdown = {
      cleanliness: reviews.reduce((sum, item) => sum + item.cleanliness, 0) / totalReviews,
      accuracy: reviews.reduce((sum, item) => sum + item.accuracy, 0) / totalReviews,
      communication: reviews.reduce((sum, item) => sum + item.communication, 0) / totalReviews,
      location: reviews.reduce((sum, item) => sum + item.location, 0) / totalReviews,
      checkIn: reviews.reduce((sum, item) => sum + item.checkIn, 0) / totalReviews,
      value: reviews.reduce((sum, item) => sum + item.value, 0) / totalReviews
    };

    return res.json({
      reviews,
      total: totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingBreakdown
    });
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch property reviews' });
  }
});

// POST /api/reviews - Create new review
router.post('/', async (req, res) => {
  try {
    const guestId = getAuthUserId(req);
    if (!guestId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const {
      propertyId,
      bookingId,
      hostId,
      rating,
      comment,
      cleanliness,
      accuracy,
      communication,
      location,
      checkIn,
      value
    } = req.body || {};

    const db = req.app.locals.db;
    const result = await db.query(
      `
        INSERT INTO property_reviews (
          property_id,
          booking_id,
          guest_id,
          host_id,
          rating,
          comment,
          cleanliness,
          accuracy,
          communication,
          location,
          check_in,
          value,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          COALESCE($6, ''),
          COALESCE($7, 0),
          COALESCE($8, 0),
          COALESCE($9, 0),
          COALESCE($10, 0),
          COALESCE($11, 0),
          COALESCE($12, 0),
          NOW(), NOW()
        )
        RETURNING
          id,
          property_id,
          booking_id,
          guest_id,
          host_id,
          rating,
          comment,
          cleanliness,
          accuracy,
          communication,
          location,
          check_in,
          value,
          created_at,
          updated_at
      `,
      [
        parseInt(propertyId, 10),
        bookingId ? parseInt(bookingId, 10) : null,
        guestId,
        parseInt(hostId, 10),
        parseInt(rating, 10),
        comment,
        cleanliness,
        accuracy,
        communication,
        location,
        checkIn,
        value
      ]
    );

    const newReview = mapPropertyReviewRow(result.rows[0]);

    // Update property rating and review count
    const statsResult = await db.query(
      `SELECT COUNT(*) AS count, AVG(rating) AS avg FROM property_reviews WHERE property_id = $1`,
      [parseInt(propertyId, 10)]
    );
    const { count, avg } = statsResult.rows[0];
    await db.query(
      `UPDATE properties SET rating = $1, review_count = $2, updated_at = NOW() WHERE id = $3`,
      [parseFloat(parseFloat(avg).toFixed(2)), parseInt(count, 10), parseInt(propertyId, 10)]
    );

    return res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Failed to create review' });
  }
});

// POST /api/reviews/host - Create host review
router.post('/host', async (req, res) => {
  try {
    const guestId = getAuthUserId(req);
    if (!guestId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const { hostId, bookingId, rating, comment } = req.body || {};
    const db = req.app.locals.db;

    const result = await db.query(
      `
        INSERT INTO host_reviews (host_id, guest_id, booking_id, rating, comment, created_at)
        VALUES ($1, $2, $3, $4, COALESCE($5, ''), NOW())
        RETURNING id, host_id, guest_id, booking_id, rating, comment, created_at
      `,
      [
        parseInt(hostId, 10),
        guestId,
        bookingId ? parseInt(bookingId, 10) : null,
        parseInt(rating, 10),
        comment
      ]
    );

    return res.status(201).json({
      message: 'Host review created successfully',
      review: mapHostReviewRow(result.rows[0])
    });
  } catch (error) {
    console.error('Error creating host review:', error);
    return res.status(500).json({ message: 'Failed to create host review' });
  }
});

// PUT /api/reviews/:id - Update review
router.put('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const {
      rating,
      comment,
      cleanliness,
      accuracy,
      communication,
      location,
      checkIn,
      value
    } = req.body || {};

    const db = req.app.locals.db;
    const result = await db.query(
      `
        UPDATE property_reviews
        SET
          rating = COALESCE($2, rating),
          comment = COALESCE($3, comment),
          cleanliness = COALESCE($4, cleanliness),
          accuracy = COALESCE($5, accuracy),
          communication = COALESCE($6, communication),
          location = COALESCE($7, location),
          check_in = COALESCE($8, check_in),
          value = COALESCE($9, value),
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          property_id,
          booking_id,
          guest_id,
          host_id,
          rating,
          comment,
          cleanliness,
          accuracy,
          communication,
          location,
          check_in,
          value,
          created_at,
          updated_at
      `,
      [reviewId, rating, comment, cleanliness, accuracy, communication, location, checkIn, value]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.json({
      message: 'Review updated successfully',
      review: mapPropertyReviewRow(result.rows[0])
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ message: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const db = req.app.locals.db;
    const result = await db.query('DELETE FROM property_reviews WHERE id = $1', [reviewId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Failed to delete review' });
  }
});

// POST /api/reviews/:id/reply - Host reply to review
router.post('/:id/reply', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    
    if (!hostId) {
      return res.status(401).json({ message: 'No authentication provided' });
    }

    const reviewId = parseInt(req.params.id, 10);
    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply cannot be empty' });
    }

    const db = req.app.locals.db;
    const websocket = req.app.locals.websocket || null;

    // Verify the review belongs to this host's property and get guest info
    const checkResult = await db.query(
      `SELECT pr.host_id, pr.guest_id, pr.booking_id, p.title as property_title
       FROM property_reviews pr
       JOIN properties p ON pr.property_id = p.id
       WHERE pr.id = $1`,
      [reviewId]
    );

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { host_id, guest_id, booking_id, property_title } = checkResult.rows[0];

    if (host_id !== hostId) {
      return res.status(403).json({ message: 'Not authorized to reply to this review' });
    }

    // Update the review with host reply
    const result = await db.query(
      `UPDATE property_reviews 
       SET host_reply = $1, host_reply_date = NOW() 
       WHERE id = $2 
       RETURNING host_reply, host_reply_date`,
      [reply.trim(), reviewId]
    );

    // Create notification for the guest
    try {
      const notificationResult = await db.query(
        `INSERT INTO user_notifications (user_id, type, title, message, subject_id, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, false, NOW())
         RETURNING id, user_id, type, title, message, subject_id, is_read, created_at`,
        [
          guest_id,
          'review_reply',
          'Host replied to your review',
          `The host has replied to your review for "${property_title}": "${reply.trim().substring(0, 100)}${reply.trim().length > 100 ? '...' : ''}"}`,
          booking_id  // Use booking_id for direct navigation to booking details
        ]
      );

      // Send notification via WebSocket if available
      if (websocket && guest_id) {
        const notification = {
          id: notificationResult.rows[0].id,
          userId: notificationResult.rows[0].user_id,
          type: notificationResult.rows[0].type,
          title: notificationResult.rows[0].title,
          message: notificationResult.rows[0].message,
          subjectId: notificationResult.rows[0].subject_id,
          read: notificationResult.rows[0].is_read,
          createdAt: notificationResult.rows[0].created_at
        };
        websocket.sendToUser(guest_id, 'notification', notification);
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the reply if notification creation fails
    }

    return res.json({
      message: 'Reply added successfully',
      hostReply: result.rows[0].host_reply,
      hostReplyDate: result.rows[0].host_reply_date
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return res.status(500).json({ message: 'Failed to add reply' });
  }
});

module.exports = router;
