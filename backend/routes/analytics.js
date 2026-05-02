const express = require('express');
const router = express.Router();
const { getAuthUserId } = require('../utils/authMiddleware');

// GET /api/analytics/host - Host analytics dashboard
router.get('/host', async (req, res) => {
  try {
    const hostId = getAuthUserId(req);
    if (!hostId) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const db = req.app.locals.db;

    const [overviewResult, propertiesResult, monthlyRevenueResult, monthlyBookingsResult, propertyPerformanceResult] = await Promise.all([
      db.query(
        `
          SELECT
            COALESCE((
              SELECT SUM(COALESCE(p.host_payout, p.amount, 0))
              FROM payments p
              WHERE p.host_id = $1 AND p.status = 'completed'
            ), 0)::numeric AS total_revenue,
            COALESCE((
              SELECT COUNT(*)
              FROM bookings b
              WHERE b.host_id = $1
            ), 0)::int AS total_bookings,
            COALESCE((
              SELECT SUM(b.guests)
              FROM bookings b
              WHERE b.host_id = $1
            ), 0)::int AS total_guests
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT COUNT(*)::int AS total_properties
          FROM properties
          WHERE host_id = $1
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') AS month_key,
            DATE_TRUNC('month', p.created_at) AS month_date,
            SUM(COALESCE(p.host_payout, p.amount, 0))::numeric AS revenue
          FROM payments p
          WHERE p.host_id = $1
            AND p.status = 'completed'
            AND p.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '6 months'
          GROUP BY month_key, month_date
          ORDER BY month_date ASC
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('month', b.created_at), 'YYYY-MM') AS month_key,
            DATE_TRUNC('month', b.created_at) AS month_date,
            COUNT(*)::int AS bookings
          FROM bookings b
          WHERE b.host_id = $1
            AND b.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '6 months'
          GROUP BY month_key, month_date
          ORDER BY month_date ASC
        `,
        [hostId]
      ),
      db.query(
        `
          SELECT
            pr.id AS property_id,
            pr.title,
            COALESCE(SUM(COALESCE(p.host_payout, p.amount, 0)), 0)::numeric AS revenue
          FROM properties pr
          LEFT JOIN bookings b
            ON b.property_id = pr.id AND b.host_id = $1
          LEFT JOIN payments p
            ON p.booking_id = b.id AND p.host_id = $1 AND p.status = 'completed'
          WHERE pr.host_id = $1
          GROUP BY pr.id, pr.title
          ORDER BY revenue DESC, pr.id ASC
          LIMIT 6
        `,
        [hostId]
      )
    ]);

    const overview = overviewResult.rows[0] || {};
    const totalProperties = propertiesResult.rows[0]?.total_properties || 0;
    const totalBookings = overview.total_bookings || 0;
    const totalRevenue = parseFloat(overview.total_revenue || 0);
    const totalGuests = overview.total_guests || 0;

    const daysWindow = 30;
    const occupancyRate = totalProperties > 0
      ? Math.min(
          100,
          Math.round((totalBookings / (totalProperties * daysWindow)) * 100)
        )
      : 0;

    const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
    const monthKeys = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - offset);
      monthKeys.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: monthFormatter.format(date)
      });
    }

    const monthlyRevenueMap = new Map(
      monthlyRevenueResult.rows.map((row) => [row.month_key, parseFloat(row.revenue || 0)])
    );
    const monthlyBookingsMap = new Map(
      monthlyBookingsResult.rows.map((row) => [row.month_key, parseInt(row.bookings, 10) || 0])
    );

    const revenueMonthly = monthKeys.map(({ key, label }) => ({
      month: label,
      revenue: monthlyRevenueMap.get(key) || 0
    }));

    const bookingsMonthly = monthKeys.map(({ key, label }) => ({
      month: label,
      bookings: monthlyBookingsMap.get(key) || 0
    }));

    const maxPropertyRevenue = Math.max(
      ...propertyPerformanceResult.rows.map((row) => parseFloat(row.revenue || 0)),
      0
    );

    const propertyPerformance = propertyPerformanceResult.rows.map((row) => {
      const revenue = parseFloat(row.revenue || 0);
      return {
        propertyId: row.property_id,
        name: row.title,
        revenue,
        performance: maxPropertyRevenue > 0
          ? Math.min(1, revenue / maxPropertyRevenue)
          : 0
      };
    });

    // Generate AI insights based on data
    const recommendations = [];
    
    // Insight: Low occupancy rate
    if (occupancyRate < 50 && totalProperties > 0) {
      recommendations.push({
        title: 'Improve Occupancy Rate',
        description: `Your occupancy rate is ${occupancyRate}%. Consider adjusting pricing or improving property descriptions to attract more bookings.`,
        estimatedRevenue: parseFloat((totalRevenue * 0.3).toFixed(2))
      });
    }
    
    // Insight: High performing properties
    if (propertyPerformance.length > 0 && maxPropertyRevenue > 0) {
      const topProperty = propertyPerformance[0];
      if (topProperty.revenue > totalRevenue * 0.4) {
        recommendations.push({
          title: 'Replicate Success',
          description: `"${topProperty.name}" generates ${Math.round((topProperty.revenue / totalRevenue) * 100)}% of your revenue. Consider what makes it successful and apply those strategies to other properties.`,
          estimatedRevenue: parseFloat((totalRevenue * 0.2).toFixed(2))
        });
      }
    }
    
    // Insight: Revenue growth opportunity
    if (revenueMonthly.length >= 2) {
      const lastMonth = revenueMonthly[revenueMonthly.length - 1].revenue;
      const prevMonth = revenueMonthly[revenueMonthly.length - 2].revenue;
      if (lastMonth < prevMonth * 0.8) {
        recommendations.push({
          title: 'Revenue Decline Alert',
          description: 'Your revenue decreased last month. Consider running promotions or updating your listings to boost bookings.',
          estimatedRevenue: parseFloat(((prevMonth - lastMonth) * 1.2).toFixed(2))
        });
      }
    }
    
    // Insight: Expand portfolio
    if (totalProperties < 3 && totalRevenue > 5000) {
      recommendations.push({
        title: 'Expand Your Portfolio',
        description: 'Your properties are performing well. Adding more listings could significantly increase your revenue.',
        estimatedRevenue: parseFloat((totalRevenue * 0.5).toFixed(2))
      });
    }

    // Get recent activity
    const recentActivityResult = await db.query(
      `
        SELECT
          b.id,
          b.status,
          b.created_at,
          b.updated_at,
          pr.title AS property_title,
          CONCAT_WS(' ', u.first_name, u.last_name) AS guest_name
        FROM bookings b
        LEFT JOIN properties pr ON pr.id = b.property_id
        LEFT JOIN users u ON u.id = b.guest_id
        WHERE b.host_id = $1
        ORDER BY b.updated_at DESC
        LIMIT 5
      `,
      [hostId]
    );

    const recentActivity = recentActivityResult.rows.map((row) => {
      const timeDiff = Date.now() - new Date(row.updated_at).getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const timeStr = hoursAgo < 1 
        ? 'Just now'
        : hoursAgo < 24 
        ? `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
        : `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? 's' : ''} ago`;

      let action = 'Booking created';
      let status = 'success';
      
      if (row.status === 'confirmed') {
        action = 'Booking confirmed';
        status = 'success';
      } else if (row.status === 'pending') {
        action = 'Booking pending';
        status = 'warning';
      } else if (row.status === 'cancelled') {
        action = 'Booking cancelled';
        status = 'error';
      } else if (row.status === 'completed') {
        action = 'Check-out completed';
        status = 'success';
      }

      return {
        property: row.property_title || 'Unknown Property',
        guest: row.guest_name || 'Guest',
        action,
        time: timeStr,
        status
      };
    });

    return res.json({
      overview: {
        totalProperties,
        totalBookings,
        totalRevenue,
        occupancyRate,
        totalGuests
      },
      revenueData: {
        monthly: revenueMonthly
      },
      bookingTrends: {
        monthly: bookingsMonthly
      },
      propertyPerformance,
      recommendations,
      recentActivity
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching host analytics', error: error.message });
  }
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