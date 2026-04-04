const express = require('express');
const router = express.Router();

// GET /api/analytics/host - Host analytics dashboard
router.get('/host', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const hostId = parseInt(token.split('_')[1]);
  
  if (hostId !== 3) { // Only for verified host
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json({
    overview: {
      totalProperties: 3,
      activeBookings: 2,
      totalRevenue: 2182.50,
      averageRating: 4.8,
      occupancyRate: 78,
      responseRate: 95
    },
    revenueData: {
      monthly: [
        { month: 'Jan 2024', revenue: 0, bookings: 0 },
        { month: 'Feb 2024', revenue: 900, bookings: 1 },
        { month: 'Mar 2024', revenue: 1350, bookings: 2 },
        { month: 'Apr 2024', revenue: 0, bookings: 0 },
        { month: 'May 2024', revenue: 600, bookings: 1 }
      ],
      yearly: [
        { year: '2022', revenue: 15420 },
        { year: '2023', revenue: 28750 },
        { year: '2024', revenue: 2850 }
      ]
    },
    bookingTrends: {
      daily: [
        { date: '2024-03-10', bookings: 1 },
        { date: '2024-03-11', bookings: 0 },
        { date: '2024-03-12', bookings: 1 },
        { date: '2024-03-13', bookings: 0 },
        { date: '2024-03-14', bookings: 1 },
        { date: '2024-03-15', bookings: 0 },
        { date: '2024-03-16', bookings: 0 }
      ],
      seasonal: [
        { season: 'Spring', bookings: 12, revenue: 2400 },
        { season: 'Summer', bookings: 28, revenue: 6720 },
        { season: 'Fall', bookings: 18, revenue: 3960 },
        { season: 'Winter', bookings: 8, revenue: 1680 }
      ]
    },
    propertyPerformance: [
      {
        propertyId: 1,
        name: 'Luxury Downtown Apartment',
        bookings: 15,
        revenue: 2250,
        averageRating: 4.8,
        occupancyRate: 85
      },
      {
        propertyId: 2,
        name: 'Cozy Beach House',
        bookings: 12,
        revenue: 2640,
        averageRating: 4.9,
        occupancyRate: 72
      },
      {
        propertyId: 3,
        name: 'Mountain Cabin Retreat',
        bookings: 18,
        revenue: 3240,
        averageRating: 4.7,
        occupancyRate: 76
      }
    ],
    guestInsights: {
      repeatGuests: 23,
      averageStayLength: 3.2,
      topCountries: [
        { country: 'United States', percentage: 65 },
        { country: 'Canada', percentage: 15 },
        { country: 'United Kingdom', percentage: 12 },
        { country: 'Germany', percentage: 8 }
      ],
      ageGroups: [
        { group: '18-25', percentage: 15 },
        { group: '26-35', percentage: 35 },
        { group: '36-45', percentage: 28 },
        { group: '46-55', percentage: 15 },
        { group: '55+', percentage: 7 }
      ]
    },
    recommendations: [
      {
        type: 'pricing',
        title: 'Optimize Pricing for Beach House',
        description: 'Consider increasing rates by 15% during summer months based on demand patterns.',
        impact: 'high',
        estimatedRevenue: 450
      },
      {
        type: 'marketing',
        title: 'Improve Mountain Cabin Photos',
        description: 'Adding more interior photos could increase booking conversion by 20%.',
        impact: 'medium',
        estimatedRevenue: 280
      },
      {
        type: 'amenities',
        title: 'Add WiFi Upgrade to Mountain Cabin',
        description: 'Guests frequently mention slow WiFi. Upgrading could improve ratings.',
        impact: 'medium',
        estimatedRevenue: 150
      }
    ]
  });
});

// GET /api/analytics/admin - Admin analytics dashboard
router.get('/admin', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1 && userId !== 2) { // Only for admins
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json({
    overview: {
      totalUsers: 156,
      totalHosts: 23,
      totalGuests: 128,
      totalProperties: 67,
      totalBookings: 342,
      totalRevenue: 89750,
      platformFees: 4487.50,
      activeListings: 58
    },
    userGrowth: {
      monthly: [
        { month: 'Jan 2024', users: 12, hosts: 2, guests: 10 },
        { month: 'Feb 2024', users: 18, hosts: 3, guests: 15 },
        { month: 'Mar 2024', users: 25, hosts: 4, guests: 21 },
        { month: 'Apr 2024', users: 15, hosts: 2, guests: 13 },
        { month: 'May 2024', users: 8, hosts: 1, guests: 7 }
      ]
    },
    revenueAnalytics: {
      monthly: [
        { month: 'Jan 2024', revenue: 12450, fees: 622.50 },
        { month: 'Feb 2024', revenue: 18750, fees: 937.50 },
        { month: 'Mar 2024', revenue: 25680, fees: 1284.00 },
        { month: 'Apr 2024', revenue: 19320, fees: 966.00 },
        { month: 'May 2024', revenue: 13550, fees: 677.50 }
      ],
      byCategory: [
        { category: 'Apartments', revenue: 45230, percentage: 50.4 },
        { category: 'Houses', revenue: 28940, percentage: 32.3 },
        { category: 'Cabins', revenue: 15580, percentage: 17.3 }
      ]
    },
    topPerformers: {
      hosts: [
        { hostId: 3, name: 'John Host', properties: 3, revenue: 8130, rating: 4.8 },
        { hostId: 6, name: 'Sarah Wilson', properties: 5, revenue: 12450, rating: 4.9 },
        { hostId: 8, name: 'Mike Johnson', properties: 2, revenue: 6780, rating: 4.7 }
      ],
      properties: [
        { propertyId: 2, name: 'Cozy Beach House', bookings: 28, revenue: 6160 },
        { propertyId: 15, name: 'Downtown Loft', bookings: 32, revenue: 4800 },
        { propertyId: 7, name: 'Lake House Retreat', bookings: 24, revenue: 5280 }
      ]
    },
    marketInsights: {
      occupancyRates: [
        { location: 'New York', rate: 78 },
        { location: 'Miami', rate: 85 },
        { location: 'Los Angeles', rate: 72 },
        { location: 'Chicago', rate: 68 }
      ],
      averagePrices: [
        { location: 'New York', price: 185 },
        { location: 'Miami', price: 220 },
        { location: 'Los Angeles', price: 165 },
        { location: 'Chicago', price: 145 }
      ]
    },
    systemHealth: {
      uptime: 99.8,
      responseTime: 245,
      errorRate: 0.02,
      activeUsers: 1247,
      peakHours: [
        { hour: '09:00', users: 156 },
        { hour: '12:00', users: 203 },
        { hour: '15:00', users: 189 },
        { hour: '18:00', users: 234 },
        { hour: '21:00', users: 198 }
      ]
    }
  });
});

// GET /api/analytics/chatbot - Chatbot analytics
router.get('/chatbot', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1 && userId !== 2) { // Only for admins
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json({
    overview: {
      totalInteractions: 1247,
      successfulResolutions: 892,
      escalatedToHuman: 123,
      averageResponseTime: 1.2,
      userSatisfaction: 4.3
    },
    interactionTrends: {
      daily: [
        { date: '2024-03-10', interactions: 45, resolved: 38 },
        { date: '2024-03-11', interactions: 52, resolved: 44 },
        { date: '2024-03-12', interactions: 38, resolved: 32 },
        { date: '2024-03-13', interactions: 61, resolved: 51 },
        { date: '2024-03-14', interactions: 47, resolved: 39 },
        { date: '2024-03-15', interactions: 55, resolved: 48 },
        { date: '2024-03-16', interactions: 42, resolved: 36 }
      ]
    },
    topQuestions: [
      { question: 'How do I cancel my booking?', count: 156, resolved: 142 },
      { question: 'What is your refund policy?', count: 134, resolved: 128 },
      { question: 'How do I contact my host?', count: 98, resolved: 89 },
      { question: 'Can I modify my reservation?', count: 87, resolved: 78 },
      { question: 'What amenities are included?', count: 76, resolved: 71 }
    ],
    performanceMetrics: {
      resolutionRate: 71.5,
      escalationRate: 9.9,
      averageSessionLength: 3.4,
      returnUserRate: 23.8
    },
    improvements: [
      {
        area: 'Booking Modifications',
        description: 'Add more detailed guidance for booking changes',
        priority: 'high',
        estimatedImpact: '15% reduction in escalations'
      },
      {
        area: 'Payment Issues',
        description: 'Improve payment troubleshooting responses',
        priority: 'medium',
        estimatedImpact: '10% improvement in resolution rate'
      }
    ]
  });
});

// GET /api/analytics/property/:propertyId - Individual property analytics
router.get('/property/:propertyId', (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  
  res.json({
    propertyId,
    overview: {
      totalBookings: 28,
      totalRevenue: 6160,
      averageRating: 4.9,
      occupancyRate: 85,
      averageStayLength: 4.2,
      repeatGuestRate: 32
    },
    bookingTrends: {
      monthly: [
        { month: 'Jan', bookings: 3, revenue: 660 },
        { month: 'Feb', bookings: 5, revenue: 1100 },
        { month: 'Mar', bookings: 7, revenue: 1540 },
        { month: 'Apr', bookings: 6, revenue: 1320 },
        { month: 'May', bookings: 7, revenue: 1540 }
      ]
    },
    guestFeedback: {
      ratingDistribution: [
        { stars: 5, count: 18 },
        { stars: 4, count: 7 },
        { stars: 3, count: 2 },
        { stars: 2, count: 1 },
        { stars: 1, count: 0 }
      ],
      commonPraises: [
        'Beautiful ocean views',
        'Clean and well-maintained',
        'Great location',
        'Responsive host'
      ],
      commonComplaints: [
        'WiFi could be faster',
        'Parking is limited'
      ]
    },
    recommendations: [
      {
        type: 'pricing',
        suggestion: 'Increase summer rates by 10%',
        impact: 'Could increase revenue by $800/month'
      },
      {
        type: 'amenities',
        suggestion: 'Upgrade WiFi package',
        impact: 'Could improve ratings and reduce complaints'
      }
    ]
  });
});

module.exports = router;