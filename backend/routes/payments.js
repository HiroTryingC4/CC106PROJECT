const express = require('express');
const router = express.Router();

// Sample payments data
let payments = [
  {
    id: 1,
    bookingId: 1,
    amount: 750,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionId: 'txn_1234567890',
    processingFee: 22.50,
    hostPayout: 727.50,
    createdAt: '2024-03-10T10:05:00.000Z',
    completedAt: '2024-03-10T10:05:30.000Z'
  },
  {
    id: 2,
    bookingId: 3,
    amount: 900,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'paypal',
    transactionId: 'txn_0987654321',
    processingFee: 27.00,
    hostPayout: 873.00,
    createdAt: '2024-02-01T09:20:00.000Z',
    completedAt: '2024-02-01T09:20:45.000Z'
  },
  {
    id: 3,
    bookingId: 4,
    amount: 600,
    currency: 'USD',
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionId: 'txn_1122334455',
    processingFee: 18.00,
    hostPayout: 582.00,
    createdAt: '2024-03-14T16:50:00.000Z',
    completedAt: '2024-03-14T16:50:15.000Z'
  },
  {
    id: 4,
    bookingId: 2,
    amount: 1100,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'credit_card',
    transactionId: null,
    processingFee: 33.00,
    hostPayout: 1067.00,
    createdAt: '2024-03-12T14:35:00.000Z',
    completedAt: null
  }
];

// Sample payout data
let payouts = [
  {
    id: 1,
    hostId: 3,
    amount: 1455.50, // Combined from multiple bookings
    currency: 'USD',
    status: 'completed',
    payoutMethod: 'bank_transfer',
    bankAccount: '****1234',
    paymentIds: [1, 2],
    createdAt: '2024-03-01T10:00:00.000Z',
    completedAt: '2024-03-03T14:30:00.000Z'
  },
  {
    id: 2,
    hostId: 3,
    amount: 582.00,
    currency: 'USD',
    status: 'pending',
    payoutMethod: 'bank_transfer',
    bankAccount: '****1234',
    paymentIds: [3],
    createdAt: '2024-03-15T09:00:00.000Z',
    completedAt: null
  }
];

// GET /api/payments - Get payments
router.get('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const { status, bookingId } = req.query;
  
  let filteredPayments = payments;
  
  // Filter by booking ownership for hosts/guests
  if (userId === 3) { // Host - show payments for their properties
    // This would need booking data to filter properly
    filteredPayments = payments; // For now, show all
  } else if (userId === 5) { // Guest - show their payments
    // This would need booking data to filter properly
    filteredPayments = payments; // For now, show all
  } else if (userId === 1 || userId === 2) { // Admin
    // Admin can see all payments
  } else {
    filteredPayments = [];
  }
  
  // Apply additional filters
  if (status) {
    filteredPayments = filteredPayments.filter(p => p.status === status);
  }
  
  if (bookingId) {
    filteredPayments = filteredPayments.filter(p => p.bookingId === parseInt(bookingId));
  }
  
  res.json({
    payments: filteredPayments,
    total: filteredPayments.length
  });
});

// GET /api/payments/payouts - Get payouts for host
router.get('/payouts', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  let filteredPayouts = payouts;
  
  if (userId === 3) { // Host
    filteredPayouts = payouts.filter(p => p.hostId === userId);
  } else if (userId === 1 || userId === 2) { // Admin
    // Admin can see all payouts
  } else {
    filteredPayouts = [];
  }
  
  res.json({
    payouts: filteredPayouts,
    total: filteredPayouts.length
  });
});

// GET /api/payments/earnings - Get earnings summary for host
router.get('/earnings', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 3) { // Only for host
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const completedPayments = payments.filter(p => p.status === 'completed');
  const totalEarnings = completedPayments.reduce((sum, p) => sum + p.hostPayout, 0);
  const totalFees = completedPayments.reduce((sum, p) => sum + p.processingFee, 0);
  const pendingEarnings = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.hostPayout, 0);
  
  const completedPayouts = payouts.filter(p => p.status === 'completed' && p.hostId === userId);
  const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = totalEarnings - totalPaidOut;
  
  res.json({
    totalEarnings,
    totalFees,
    pendingEarnings,
    availableBalance,
    totalPaidOut,
    monthlyEarnings: [
      { month: 'Jan', earnings: 0 },
      { month: 'Feb', earnings: 873.00 },
      { month: 'Mar', earnings: 1309.50 },
      { month: 'Apr', earnings: 0 },
      { month: 'May', earnings: 0 }
    ]
  });
});

// POST /api/payments/process - Process payment
router.post('/process', (req, res) => {
  const newPayment = {
    id: payments.length + 1,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  payments.push(newPayment);
  
  res.status(201).json({
    message: 'Payment initiated successfully',
    payment: newPayment
  });
});

// POST /api/payments/payouts - Request payout
router.post('/payouts', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const hostId = parseInt(token.split('_')[1]);
  
  const newPayout = {
    id: payouts.length + 1,
    hostId,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  payouts.push(newPayout);
  
  res.status(201).json({
    message: 'Payout requested successfully',
    payout: newPayout
  });
});

module.exports = router;