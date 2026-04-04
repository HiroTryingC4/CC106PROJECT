const express = require('express');
const router = express.Router();

// Sample reviews data
let reviews = [
  {
    id: 1,
    propertyId: 1,
    bookingId: 3,
    guestId: 5,
    hostId: 3,
    rating: 5,
    comment: 'Amazing apartment with stunning views! John was a fantastic host and very responsive. The location is perfect for exploring downtown. Highly recommended!',
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    checkIn: 5,
    value: 4,
    createdAt: '2024-02-16T10:00:00.000Z',
    updatedAt: '2024-02-16T10:00:00.000Z'
  },
  {
    id: 2,
    propertyId: 2,
    bookingId: 1,
    guestId: 5,
    hostId: 3,
    rating: 5,
    comment: 'The beach house exceeded all expectations! Waking up to ocean views every morning was incredible. The house was spotless and had everything we needed.',
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    checkIn: 5,
    value: 5,
    createdAt: '2024-03-26T14:30:00.000Z',
    updatedAt: '2024-03-26T14:30:00.000Z'
  },
  {
    id: 3,
    propertyId: 3,
    bookingId: 4,
    guestId: 5,
    hostId: 3,
    rating: 4,
    comment: 'Great mountain retreat! The cabin was cozy and the fireplace was perfect for cold evenings. Only minor issue was the WiFi was a bit slow, but that added to the disconnect from city life.',
    cleanliness: 4,
    accuracy: 4,
    communication: 5,
    location: 5,
    checkIn: 4,
    value: 4,
    createdAt: '2024-05-06T16:45:00.000Z',
    updatedAt: '2024-05-06T16:45:00.000Z'
  }
];

// Sample host reviews (guests reviewing hosts)
let hostReviews = [
  {
    id: 1,
    hostId: 3,
    guestId: 5,
    bookingId: 3,
    rating: 5,
    comment: 'John is an exceptional host! Very welcoming, provided great local recommendations, and was always available when needed.',
    createdAt: '2024-02-16T10:05:00.000Z'
  },
  {
    id: 2,
    hostId: 3,
    guestId: 5,
    bookingId: 1,
    rating: 5,
    comment: 'Outstanding hospitality! John went above and beyond to ensure our stay was perfect.',
    createdAt: '2024-03-26T14:35:00.000Z'
  }
];

// GET /api/reviews - Get reviews
router.get('/', (req, res) => {
  const { propertyId, hostId, guestId } = req.query;
  
  let filteredReviews = reviews;
  
  if (propertyId) {
    filteredReviews = filteredReviews.filter(r => r.propertyId === parseInt(propertyId));
  }
  
  if (hostId) {
    filteredReviews = filteredReviews.filter(r => r.hostId === parseInt(hostId));
  }
  
  if (guestId) {
    filteredReviews = filteredReviews.filter(r => r.guestId === parseInt(guestId));
  }
  
  res.json({
    reviews: filteredReviews,
    total: filteredReviews.length
  });
});

// GET /api/reviews/host/:hostId - Get host reviews
router.get('/host/:hostId', (req, res) => {
  const hostId = parseInt(req.params.hostId);
  const filteredReviews = hostReviews.filter(r => r.hostId === hostId);
  
  res.json({
    reviews: filteredReviews,
    total: filteredReviews.length
  });
});

// GET /api/reviews/property/:propertyId - Get property reviews
router.get('/property/:propertyId', (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  const filteredReviews = reviews.filter(r => r.propertyId === propertyId);
  
  // Calculate average ratings
  const totalReviews = filteredReviews.length;
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
  
  const averageRating = filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingBreakdown = {
    cleanliness: filteredReviews.reduce((sum, r) => sum + r.cleanliness, 0) / totalReviews,
    accuracy: filteredReviews.reduce((sum, r) => sum + r.accuracy, 0) / totalReviews,
    communication: filteredReviews.reduce((sum, r) => sum + r.communication, 0) / totalReviews,
    location: filteredReviews.reduce((sum, r) => sum + r.location, 0) / totalReviews,
    checkIn: filteredReviews.reduce((sum, r) => sum + r.checkIn, 0) / totalReviews,
    value: filteredReviews.reduce((sum, r) => sum + r.value, 0) / totalReviews
  };
  
  res.json({
    reviews: filteredReviews,
    total: totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingBreakdown
  });
});

// POST /api/reviews - Create new review
router.post('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const guestId = parseInt(token.split('_')[1]);
  
  const newReview = {
    id: reviews.length + 1,
    guestId,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  reviews.push(newReview);
  
  res.status(201).json({
    message: 'Review created successfully',
    review: newReview
  });
});

// POST /api/reviews/host - Create host review
router.post('/host', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const guestId = parseInt(token.split('_')[1]);
  
  const newHostReview = {
    id: hostReviews.length + 1,
    guestId,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  hostReviews.push(newHostReview);
  
  res.status(201).json({
    message: 'Host review created successfully',
    review: newHostReview
  });
});

// PUT /api/reviews/:id - Update review
router.put('/:id', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }
  
  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'Review updated successfully',
    review: reviews[reviewIndex]
  });
});

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', (req, res) => {
  const reviewId = parseInt(req.params.id);
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }
  
  reviews.splice(reviewIndex, 1);
  
  res.json({ message: 'Review deleted successfully' });
});

module.exports = router;