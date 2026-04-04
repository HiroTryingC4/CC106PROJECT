const express = require('express');
const router = express.Router();

// Import host route to access hostData
let hostRouter = null;

// Set host router reference (will be set by server.js)
router.setHostRouter = (host) => {
  hostRouter = host;
};

// Sample admin data
let notifications = [
  {
    id: 1,
    type: 'host_verification',
    title: 'New Host Verification Pending',
    message: 'Sarah NewHost has submitted verification documents for review.',
    userId: 4,
    priority: 'high',
    read: false,
    createdAt: '2024-03-15T10:30:00.000Z'
  },
  {
    id: 2,
    type: 'payment_issue',
    title: 'Payment Processing Delay',
    message: 'Booking #1234 payment is experiencing processing delays.',
    userId: null,
    priority: 'medium',
    read: false,
    createdAt: '2024-03-14T16:20:00.000Z'
  },
  {
    id: 3,
    type: 'review_flagged',
    title: 'Review Flagged for Moderation',
    message: 'A review for Property #567 has been flagged by the host.',
    userId: null,
    priority: 'low',
    read: true,
    createdAt: '2024-03-13T09:15:00.000Z'
  }
];

let activityLogs = [
  {
    id: 1,
    userId: 1,
    action: 'user_login',
    description: 'Admin user logged in',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-03-16T08:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    action: 'host_verification_approved',
    description: 'Approved host verification for John Host',
    targetUserId: 3,
    createdAt: '2024-03-15T14:30:00.000Z'
  },
  {
    id: 3,
    userId: 2,
    action: 'property_suspended',
    description: 'Suspended property #789 due to policy violation',
    targetPropertyId: 789,
    createdAt: '2024-03-14T11:45:00.000Z'
  },
  {
    id: 4,
    userId: 1,
    action: 'user_banned',
    description: 'Banned user for violating terms of service',
    targetUserId: 99,
    createdAt: '2024-03-13T16:20:00.000Z'
  }
];

let hostVerifications = [
  {
    id: 1,
    hostId: 3,
    hostName: 'John Host',
    email: 'host@smartstay.com',
    businessName: 'Sample Property Management',
    businessAddress: '123 Business St, USA',
    businessType: 'Property Management',
    idType: 'Passport',
    idNumber: 'K87654321',
    taxId: '12-3456789',
    submitted: '2024-03-01T10:00:00.000Z',
    status: 'approved'
  }
];

let systemSettings = {
  platform: {
    maintenanceMode: false,
    registrationEnabled: true,
    bookingEnabled: true,
    paymentProcessing: true
  },
  fees: {
    hostCommission: 3.0,
    guestServiceFee: 5.0,
    paymentProcessingFee: 2.9
  },
  limits: {
    maxPropertiesPerHost: 10,
    maxGuestsPerBooking: 16,
    maxBookingDuration: 30,
    minBookingDuration: 1
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    twoFactorRequired: false
  }
};

// GET /api/admin/dashboard - Admin dashboard overview
router.get('/dashboard', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1 && userId !== 2) { // Only for admins
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json({
    stats: {
      totalUsers: 156,
      totalHosts: 23,
      totalGuests: 128,
      totalProperties: 67,
      activeBookings: 45,
      pendingVerifications: 3,
      flaggedReviews: 2,
      systemAlerts: 1
    },
    recentActivity: activityLogs.slice(0, 10),
    notifications: notifications.filter(n => !n.read).slice(0, 5),
    systemHealth: {
      serverStatus: 'healthy',
      databaseStatus: 'healthy',
      paymentGateway: 'healthy',
      uptime: '99.8%',
      responseTime: '245ms'
    }
  });
});

// GET /api/admin/users - User management
router.get('/users', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1 && userId !== 2) { // Only for admins
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Extended user data for admin view
  const adminUsers = [
    {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@smartstay.com',
      role: 'admin',
      verificationStatus: 'verified',
      joinDate: '2024-01-01T00:00:00.000Z',
      lastLogin: '2024-03-16T08:00:00.000Z',
      status: 'active',
      propertiesCount: 0,
      bookingsCount: 0,
      totalRevenue: 0
    },
    {
      id: 2,
      firstName: 'Communication',
      lastName: 'Admin',
      email: 'comadmin@smartstay.com',
      role: 'communication_admin',
      verificationStatus: 'verified',
      joinDate: '2024-01-01T00:00:00.000Z',
      lastLogin: '2024-03-15T14:30:00.000Z',
      status: 'active',
      propertiesCount: 0,
      bookingsCount: 0,
      totalRevenue: 0
    },
    {
      id: 3,
      firstName: 'John',
      lastName: 'Host',
      email: 'host@smartstay.com',
      role: 'host',
      verificationStatus: 'verified',
      joinDate: '2024-01-15T10:00:00.000Z',
      lastLogin: '2024-03-16T07:45:00.000Z',
      status: 'active',
      propertiesCount: 3,
      bookingsCount: 28,
      totalRevenue: 8130.00
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'NewHost',
      email: 'newhost@smartstay.com',
      role: 'host',
      verificationStatus: 'pending',
      joinDate: '2024-03-10T14:20:00.000Z',
      lastLogin: '2024-03-15T16:30:00.000Z',
      status: 'active',
      propertiesCount: 0,
      bookingsCount: 0,
      totalRevenue: 0
    },
    {
      id: 5,
      firstName: 'Jane',
      lastName: 'Guest',
      email: 'guest@smartstay.com',
      role: 'guest',
      verificationStatus: 'not_required',
      joinDate: '2024-02-01T09:15:00.000Z',
      lastLogin: '2024-03-14T19:20:00.000Z',
      status: 'active',
      propertiesCount: 0,
      bookingsCount: 12,
      totalRevenue: 0
    }
  ];
  
  const { role, status, search } = req.query;
  let filteredUsers = adminUsers;
  
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }
  
  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.firstName.toLowerCase().includes(searchLower) ||
      u.lastName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  }
  
  res.json({
    users: filteredUsers,
    total: filteredUsers.length
  });
});

// GET /api/admin/notifications - Get admin notifications
router.get('/notifications', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1 && userId !== 2) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const { read, type } = req.query;
  let filteredNotifications = notifications;
  
  if (read !== undefined) {
    filteredNotifications = filteredNotifications.filter(n => n.read === (read === 'true'));
  }
  
  if (type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }
  
  res.json({
    notifications: filteredNotifications,
    total: filteredNotifications.length,
    unreadCount: notifications.filter(n => !n.read).length
  });
});

// GET /api/admin/activity-logs - Get system activity logs
router.get('/activity-logs', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1 && userId !== 2) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const { action, userId: filterUserId, limit = 50 } = req.query;
  let filteredLogs = activityLogs;
  
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  if (filterUserId) {
    filteredLogs = filteredLogs.filter(log => log.userId === parseInt(filterUserId));
  }
  
  // Sort by most recent first and limit results
  filteredLogs = filteredLogs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, parseInt(limit));
  
  res.json({
    logs: filteredLogs,
    total: filteredLogs.length
  });
});

// GET /api/admin/settings - Get system settings
router.get('/settings', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1) { // Only main admin
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(systemSettings);
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (userId !== 1) { // Only main admin
    return res.status(403).json({ message: 'Access denied' });
  }
  
  systemSettings = { ...systemSettings, ...req.body };
  
  // Log the settings change
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId,
    action: 'settings_updated',
    description: 'System settings updated',
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: 'Settings updated successfully',
    settings: systemSettings
  });
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const adminId = parseInt(token.split('_')[1]);
  const targetUserId = parseInt(req.params.id);
  const { status } = req.body;
  
  if (adminId !== 1 && adminId !== 2) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Log the user status change
  activityLogs.unshift({
    id: activityLogs.length + 1,
    userId: adminId,
    action: 'user_status_changed',
    description: `Changed user status to ${status}`,
    targetUserId,
    createdAt: new Date().toISOString()
  });
  
  res.json({
    message: `User status updated to ${status}`,
    userId: targetUserId,
    newStatus: status
  });
});

// PUT /api/admin/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', (req, res) => {
  const notificationId = parseInt(req.params.id);
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  notifications[notificationIndex].read = true;
  
  res.json({
    message: 'Notification marked as read',
    notification: notifications[notificationIndex]
  });
});

// POST /api/admin/notifications - Create new notification
router.post('/notifications', (req, res) => {
  const newNotification = {
    id: notifications.length + 1,
    ...req.body,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(newNotification);
  
  res.status(201).json({
    message: 'Notification created successfully',
    notification: newNotification
  });
});

// GET /api/admin/host-verifications - Get all host verification requests
router.get('/host-verifications', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const adminId = parseInt(token.split('_')[1]);
    if (adminId !== 1 && adminId !== 2) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      data: hostVerifications,
      total: hostVerifications.length,
      message: 'Host verifications retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching host verifications', error: error.message });
  }
});

// Export hostVerifications for other routes to access
router.hostVerifications = hostVerifications;

// PUT /api/admin/host-verifications/:id/approve - Approve host verification
router.put('/host-verifications/:id/approve', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const adminId = parseInt(token.split('_')[1]);
    if (adminId !== 1 && adminId !== 2) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const verificationId = parseInt(req.params.id);
    const verification = hostVerifications.find(v => v.id === verificationId);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Update verification status
    verification.status = 'approved';
    verification.approvedAt = new Date().toISOString();
    verification.approvedBy = adminId;

    // Also update host verification status in host router if available
    if (hostRouter && hostRouter.hostData) {
      const hostId = verification.hostId;
      if (!hostRouter.hostData[hostId]) {
        hostRouter.hostData[hostId] = {};
      }
      hostRouter.hostData[hostId].verificationStatus = 'verified';
      hostRouter.hostData[hostId].verified = true;
      hostRouter.hostData[hostId].approvedAt = new Date().toISOString();
      hostRouter.hostData[hostId].approvedBy = adminId;
      console.log(`Updated host ${hostId} verification status to verified`);
    }

    // Log activity
    activityLogs.unshift({
      id: activityLogs.length + 1,
      userId: adminId,
      action: 'host_verification_approved',
      description: `Approved host verification for host ID ${verification.hostId}`,
      targetUserId: verification.hostId,
      createdAt: new Date().toISOString()
    });

    res.json({
      message: 'Host verification approved successfully',
      verification: verification
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving verification', error: error.message });
  }
});

// PUT /api/admin/host-verifications/:id/reject - Reject host verification
router.put('/host-verifications/:id/reject', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const adminId = parseInt(token.split('_')[1]);
    if (adminId !== 1 && adminId !== 2) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const verificationId = parseInt(req.params.id);
    const verification = hostVerifications.find(v => v.id === verificationId);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    const { reason } = req.body;

    // Update verification status
    verification.status = 'rejected';
    verification.rejectedAt = new Date().toISOString();
    verification.rejectedBy = adminId;
    verification.rejectionReason = reason || 'No reason provided';

    // Also update host verification status in host router if available
    if (hostRouter && hostRouter.hostData) {
      const hostId = verification.hostId;
      if (!hostRouter.hostData[hostId]) {
        hostRouter.hostData[hostId] = {};
      }
      hostRouter.hostData[hostId].verificationStatus = 'rejected';
      hostRouter.hostData[hostId].verified = false;
      hostRouter.hostData[hostId].rejectedAt = new Date().toISOString();
      hostRouter.hostData[hostId].rejectedBy = adminId;
      hostRouter.hostData[hostId].rejectionReason = reason || 'No reason provided';
      console.log(`Updated host ${hostId} verification status to rejected`);
    }

    // Log activity
    activityLogs.unshift({
      id: activityLogs.length + 1,
      userId: adminId,
      action: 'host_verification_rejected',
      description: `Rejected host verification for host ID ${verification.hostId}`,
      targetUserId: verification.hostId,
      createdAt: new Date().toISOString()
    });

    res.json({
      message: 'Host verification rejected successfully',
      verification: verification
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting verification', error: error.message });
  }
});

module.exports = router;