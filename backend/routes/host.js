const express = require('express');
const router = express.Router();

// Import admin route to access hostVerifications
let adminRouter = null;

// Set admin router reference (will be set by server.js)
router.setAdminRouter = (admin) => {
  adminRouter = admin;
};

// In-memory storage for host data
let hostData = {
  3: { // Host ID 3 (John Host)
    verified: true,
    verificationStatus: 'verified',
    submittedAt: '2024-01-15T10:00:00.000Z',
    lastUpdated: '2024-01-20T15:30:00.000Z',
    dashboard: {
      activeListings: 3,
      totalBookings: 12,
      upcomingBookings: 2,
      totalEarnings: 45250,
      monthlyRevenue: 12500,
      occupancyRate: 85
    },
    expenses: [
      {
        id: 1,
        date: '2024-03-24',
        type: 'Marketing expense',
        description: 'Facebook ads',
        property: 'Trial#1',
        amount: 2000,
        category: 'Marketing Expenses'
      }
    ]
  }
};

// Sample bookings for reference
let bookings = [
  {
    id: 1,
    propertyId: 1,
    guestId: 5,
    hostId: 3,
    guestName: 'Jane Guest',
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
    guestId: 5,
    hostId: 3,
    guestName: 'Jane Guest',
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
    guestId: 5,
    hostId: 3,
    guestName: 'Jane Guest',
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
    guestId: 5,
    hostId: 3,
    guestName: 'Jane Guest',
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

// Sample properties for reference
let properties = [
  {
    id: 1,
    title: 'Luxury Beachfront Condo',
    type: 'Condo',
    location: 'Beach', 
    price: 150,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    rating: 4.5,
    reviews: 45,
    bookings: 8,
    status: 'approved',
    hostId: 3
  },
  {
    id: 2,
    title: 'Modern Downtown Studio',
    type: 'Studio',
    location: 'Downtown',
    price: 85,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    rating: 4.2,
    reviews: 28,
    bookings: 12,
    status: 'approved',
    hostId: 3
  },
  {
    id: 3,
    title: 'Family-Friendly Villa',
    type: 'Villa',
    location: 'Suburb',
    price: 220,
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    rating: 4.6,
    reviews: 62,
    bookings: 15,
    status: 'approved',
    hostId: 3
  }
];

// ====================
// HOST VERIFICATION
// ====================

// GET /api/host/verification-status
router.get('/verification-status', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const host = hostData[hostId];

    // If host doesn't exist in hostData yet, lazy initialize
    if (!host) {
      // Initialize with default status
      hostData[hostId] = {
        verified: false,
        verificationStatus: 'not_submitted',
        submittedAt: null,
        lastUpdated: null,
        profile: {},
        dashboard: {
          activeListings: 0,
          totalBookings: 0,
          upcomingBookings: 0,
          totalEarnings: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        },
        expenses: [],
        verification: null
      };

      return res.json({
        status: 'not_submitted',
        message: 'You have not submitted verification yet.',
        submittedAt: null,
        lastUpdated: null,
        verified: false
      });
    }

    // If verification object exists, they have submitted
    let finalStatus = host.verificationStatus || 'not_submitted';
    if (host.verification && !host.verificationStatus) {
      finalStatus = 'pending';
    }

    // Return actual status from hostData
    return res.json({
      status: finalStatus,
      message: `Your verification status is ${finalStatus}`,
      submittedAt: host.submittedAt || null,
      lastUpdated: host.lastUpdated || null,
      verified: host.verified || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verification status', error: error.message });
  }
});

// GET /api/host/debug - Debug endpoint to check host data
router.get('/debug', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const host = hostData[hostId];

    res.json({
      hostId: hostId,
      hostDataExists: !!host,
      hostData: host || 'Not initialized',
      allHostIds: Object.keys(hostData).map(id => parseInt(id))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in debug', error: error.message });
  }
});

// GET /api/host/profile - Get host's profile information
router.get('/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const host = hostData[hostId];

    if (!host || !host.profile) {
      return res.status(404).json({ message: 'Host profile not found' });
    }

    res.json({
      success: true,
      data: host.profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching host profile', error: error.message });
  }
});

// GET /api/host/verification-data - Get submitted verification form data
router.get('/verification-data', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const host = hostData[hostId];

    if (!host || !host.verification) {
      return res.json({
        data: null,
        message: 'No verification data found'
      });
    }

    return res.json({
      data: host.verification,
      status: host.verificationStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching verification data', error: error.message });
  }
});

// POST /api/host/verify - Submit verification
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const { firstName, lastName, email, phone, company, businessAddress, businessType, yearsOfExperience, propertyCount, expectedRevenue, bankName, accountNumber, routingNumber } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !bankName || !accountNumber) {
      return res.status(400).json({ message: 'Missing required verification fields' });
    }

    // Store or update verification
    hostData[hostId] = {
      ...hostData[hostId],
      verified: true,
      verificationStatus: 'verified',
      firstName,
      lastName,
      email,
      phone,
      company,
      businessAddress,
      businessType,
      yearsOfExperience,
      propertyCount,
      expectedRevenue,
      bankName,
      accountNumber: `****${accountNumber.slice(-4)}`,
      routingNumber: `****${routingNumber.slice(-4)}`,
      submittedAt: hostData[hostId]?.submittedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    res.json({
      id: hostId,
      status: 'verified',
      message: 'Verification submitted successfully and approved',
      submittedAt: hostData[hostId].submittedAt,
      verified: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting verification', error: error.message });
  }
});

// POST /api/host/verification - Submit verification documents (from form)
router.post('/verification', (req, res) => {
  try {
    console.log('Verification request received');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    console.log('Host ID extracted:', hostId);

    const { businessName, businessType, businessAddress, idType, idNumber, taxId, email, hostName } = req.body;

    console.log('Extracted fields:', { businessName, businessType, businessAddress, idType, idNumber, taxId, email, hostName });

    // Validate required fields
    if (!businessName || !businessType || !businessAddress || !idType || !idNumber) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['businessName', 'businessType', 'businessAddress', 'idType', 'idNumber'],
        received: { businessName, businessType, businessAddress, idType, idNumber }
      });
    }

    // Store verification submission
    if (!hostData[hostId]) {
      hostData[hostId] = {
        verified: false,
        verificationStatus: 'pending',
        profile: {},
        dashboard: {
          activeListings: 0,
          totalBookings: 0,
          upcomingBookings: 0,
          totalEarnings: 0,
          monthlyRevenue: 0,
          occupancyRate: 0
        },
        expenses: [],
        verification: null
      };
    }

    const submittedAt = new Date().toISOString();
    
    hostData[hostId].verification = {
      businessName,
      businessType,
      businessAddress,
      idType,
      idNumber,
      taxId: taxId || 'none',
      submittedAt: submittedAt,
      status: 'pending_review'
    };

    hostData[hostId].verificationStatus = 'pending';
    hostData[hostId].submittedAt = submittedAt;
    hostData[hostId].lastUpdated = submittedAt;

    // Also add to admin's host verifications list if admin router is available
    if (adminRouter && adminRouter.hostVerifications) {
      const existingIndex = adminRouter.hostVerifications.findIndex(v => v.hostId === hostId);
      
      const verificationEntry = {
        id: adminRouter.hostVerifications.length + 1,
        hostId: hostId,
        hostName: hostName || `Host ${hostId}`,
        email: email || `host${hostId}@smartstay.com`,
        businessName: businessName,
        businessAddress: businessAddress,
        businessType: businessType,
        idType: idType,
        idNumber: idNumber,
        taxId: taxId || 'none',
        submitted: new Date().toISOString(),
        status: 'pending'
      };

      if (existingIndex >= 0) {
        // Update existing verification
        adminRouter.hostVerifications[existingIndex] = verificationEntry;
      } else {
        // Add new verification
        adminRouter.hostVerifications.push(verificationEntry);
      }
    }

    console.log('Verification stored successfully for host', hostId);

    res.status(201).json({
      id: hostId,
      status: 'pending_review',
      message: 'Verification documents submitted successfully! Your submission is under review.',
      data: hostData[hostId].verification,
      submittedAt: hostData[hostId].verification.submittedAt
    });
  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ message: 'Error submitting verification', error: error.message });
  }
});

// ====================
// HOST DASHBOARD
// ====================

// GET /api/host/dashboard - Get host dashboard stats
router.get('/dashboard', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const host = hostData[hostId];

    if (!host) {
      return res.status(403).json({ message: 'Host data not found' });
    }

    // Get host's bookings
    const hostBookings = bookings.filter(b => b.hostId === hostId);
    const recentBookings = hostBookings.slice(0, 3).map(b => ({
      id: b.id,
      guestName: b.guestName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status,
      totalAmount: b.totalAmount
    }));

    // Get host's properties
    const hostProperties = properties.filter(p => p.hostId === hostId);

    res.json({
      data: {
        stats: {
          activeListings: hostProperties.filter(p => p.status === 'approved').length,
          totalBookings: hostBookings.length,
          upcomingBookings: hostBookings.filter(b => b.status === 'confirmed').length,
          totalEarnings: host.dashboard?.totalEarnings || 45250,
          monthlyRevenue: host.dashboard?.monthlyRevenue || 12500,
          occupancyRate: host.dashboard?.occupancyRate || 85
        },
        recentBookings,
        properties: hostProperties.map(p => ({
          id: p.id,
          title: p.title,
          status: p.status,
          bookings: hostBookings.filter(b => b.propertyId === p.id).length,
          rating: p.rating
        })),
        alerts: [
          {
            id: 1,
            type: 'info',
            message: 'You have 2 upcoming check-ins this week',
            date: new Date().toISOString()
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// ====================
// HOST BOOKINGS MANAGEMENT
// ====================

// GET /api/host/bookings - Get host's bookings
router.get('/bookings', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const { status, sort } = req.query;

    // Get host's bookings
    let hostBookings = bookings.filter(b => b.hostId === hostId);

    // Filter by status if provided
    if (status) {
      hostBookings = hostBookings.filter(b => b.status === status);
    }

    // Sort if provided
    if (sort === '-checkIn') {
      hostBookings.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
    } else {
      hostBookings.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
    }

    res.json({
      data: hostBookings.map(b => ({
        id: b.id,
        propertyId: b.propertyId,
        guestId: b.guestId,
        guestName: b.guestName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        totalAmount: b.totalAmount,
        status: b.status,
        paymentStatus: b.paymentStatus,
        specialRequests: b.specialRequests
      })),
      total: hostBookings.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// PUT /api/host/bookings/:id/accept - Accept booking
router.put('/bookings/:id/accept', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const bookingId = parseInt(req.params.id);

    const booking = bookings.find(b => b.id === bookingId && b.hostId === hostId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'confirmed';
    booking.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming booking', error: error.message });
  }
});

// PUT /api/host/bookings/:id/reject - Reject booking
router.put('/bookings/:id/reject', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const bookingId = parseInt(req.params.id);
    const { reason } = req.body;

    const booking = bookings.find(b => b.id === bookingId && b.hostId === hostId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'rejected';
    booking.rejectReason = reason || 'Host declined';
    booking.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Booking rejected successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting booking', error: error.message });
  }
});

// ====================
// HOST FINANCIAL
// ====================

// GET /api/host/financial - Get host financial data
router.get('/financial', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const host = hostData[hostId];

    if (!host) {
      return res.status(403).json({ message: 'Host data not found' });
    }

    const hostBookings = bookings.filter(b => b.hostId === hostId && b.paymentStatus === 'paid');
    const totalRevenue = hostBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalExpenses = (host.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    res.json({
      data: {
        stats: {
          totalRevenue: totalRevenue || 21321,
          totalExpenses: totalExpenses || 5000,
          netProfit: netProfit || 16321,
          profitMargin: profitMargin || 76.5,
          commission: (totalRevenue * 0.03).toFixed(2) || 639.63
        },
        monthlyData: [
          { month: 'Jan', revenue: 5000 },
          { month: 'Feb', revenue: 6500 },
          { month: 'Mar', revenue: 9821 }
        ],
        expenses: host.expenses || [],
        recentTransactions: hostBookings.slice(0, 5).map(b => ({
          id: b.id,
          date: b.checkOut,
          type: 'booking_income',
          amount: b.totalAmount,
          description: `Payment from booking #${b.id}`,
          status: 'completed'
        })),
        bankDetails: {
          bankName: host.bankName || 'First National Bank',
          accountLast4: host.accountNumber?.slice(-4) || '1234'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial data', error: error.message });
  }
});

// POST /api/host/expenses - Add expense
router.post('/expenses', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const hostId = parseInt(token.split('_')[1]);
    const { date, type, description, amount, category, property } = req.body;

    // Validate required fields
    if (!date || !amount || !category) {
      return res.status(400).json({ message: 'Missing required expense fields' });
    }

    const expense = {
      id: (hostData[hostId].expenses?.length || 0) + 1,
      date,
      type,
      description,
      property,
      amount,
      category
    };

    if (!hostData[hostId].expenses) {
      hostData[hostId].expenses = [];
    }

    hostData[hostId].expenses.push(expense);

    res.json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
});

// Function to initialize new host data when they register
const initializeNewHost = (hostId, firstName, lastName, email, company) => {
  if (!hostData[hostId]) {
    hostData[hostId] = {
      verified: false,
      verificationStatus: 'not_submitted',
      submittedAt: null,
      lastUpdated: null,
      profile: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        company: company || '',
        fullName: `${firstName} ${lastName}`
      },
      dashboard: {
        activeListings: 0,
        totalBookings: 0,
        upcomingBookings: 0,
        totalEarnings: 0,
        monthlyRevenue: 0,
        occupancyRate: 0
      },
      expenses: [],
      verification: null
    };
  }
  return hostData[hostId];
};

// Export hostData and initialization function for other routes to access
router.hostData = hostData;
router.initializeNewHost = initializeNewHost;

module.exports = router;
