const express = require('express');
const router = express.Router();

// Sample bookings data
let bookings = [
  {
    id: 1,
    propertyId: 1,
    guestId: 5, // Jane Guest
    hostId: 3, // John Host
    checkIn: '2024-03-20T15:00:00.000Z',
    checkOut: '2024-03-25T11:00:00.000Z',
    guests: 2,
    totalAmount: 750,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialRequests: 'Late check-in requested',
    createdAt: '2024-03-10T10:00:00.000Z',
    updatedAt: '2024-03-10T10:00:00.000Z'
  },
  {
    id: 2,
    propertyId: 2,
    guestId: 5, // Jane Guest
    hostId: 3, // John Host
    checkIn: '2024-04-15T15:00:00.000Z',
    checkOut: '2024-04-20T11:00:00.000Z',
    guests: 4,
    totalAmount: 1100,
    status: 'pending',
    paymentStatus: 'pending',
    specialRequests: 'Pet-friendly accommodation needed',
    createdAt: '2024-03-12T14:30:00.000Z',
    updatedAt: '2024-03-12T14:30:00.000Z'
  },
  {
    id: 3,
    propertyId: 3,
    guestId: 5, // Jane Guest
    hostId: 3, // John Host
    checkIn: '2024-02-10T15:00:00.000Z',
    checkOut: '2024-02-15T11:00:00.000Z',
    guests: 3,
    totalAmount: 900,
    status: 'completed',
    paymentStatus: 'paid',
    specialRequests: 'Early check-in if possible',
    createdAt: '2024-02-01T09:15:00.000Z',
    updatedAt: '2024-02-15T12:00:00.000Z'
  },
  {
    id: 4,
    propertyId: 1,
    guestId: 5, // Jane Guest
    hostId: 3, // John Host
    checkIn: '2024-05-01T15:00:00.000Z',
    checkOut: '2024-05-05T11:00:00.000Z',
    guests: 2,
    totalAmount: 600,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialRequests: '',
    createdAt: '2024-03-14T16:45:00.000Z',
    updatedAt: '2024-03-14T16:45:00.000Z'
  }
];

// GET /api/bookings - Get bookings (filtered by user role)
router.get('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const { status, propertyId } = req.query;
  
  let filteredBookings = bookings;
  
  // Filter by user role
  if (userId === 3) { // Host
    filteredBookings = bookings.filter(b => b.hostId === userId);
  } else if (userId === 5) { // Guest
    filteredBookings = bookings.filter(b => b.guestId === userId);
  } else if (userId === 1 || userId === 2) { // Admin
    // Admin can see all bookings
  } else {
    filteredBookings = [];
  }
  
  // Apply additional filters
  if (status) {
    filteredBookings = filteredBookings.filter(b => b.status === status);
  }
  
  if (propertyId) {
    filteredBookings = filteredBookings.filter(b => b.propertyId === parseInt(propertyId));
  }
  
  res.json({
    bookings: filteredBookings,
    total: filteredBookings.length
  });
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = bookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  res.json(booking);
});

// POST /api/bookings - Create new booking
router.post('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const guestId = parseInt(token.split('_')[1]);
  
  const newBooking = {
    id: bookings.length + 1,
    guestId,
    ...req.body,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  
  res.status(201).json({
    message: 'Booking created successfully',
    booking: newBooking
  });
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'Booking updated successfully',
    booking: bookings[bookingIndex]
  });
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  // Mark as cancelled instead of deleting
  bookings[bookingIndex].status = 'cancelled';
  bookings[bookingIndex].updatedAt = new Date().toISOString();
  
  res.json({ 
    message: 'Booking cancelled successfully',
    booking: bookings[bookingIndex]
  });
});

module.exports = router;