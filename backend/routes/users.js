const express = require('express');
const router = express.Router();

// Sample user profiles and messages data
let userProfiles = {
  1: {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@smartstay.com',
    phone: '+1-555-0101',
    bio: 'Platform administrator ensuring smooth operations.',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false
    }
  },
  2: {
    id: 2,
    firstName: 'Communication',
    lastName: 'Admin',
    email: 'comadmin@smartstay.com',
    phone: '+1-555-0102',
    bio: 'Managing communications and customer support.',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: true
    }
  },
  3: {
    id: 3,
    firstName: 'John',
    lastName: 'Host',
    email: 'host@smartstay.com',
    phone: '+1-555-0103',
    bio: 'Experienced host with 5 years in hospitality. I love sharing my beautiful properties with travelers from around the world.',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: true
    },
    hostInfo: {
      yearsHosting: 5,
      responseRate: 95,
      responseTime: '1 hour',
      languages: ['English', 'Spanish'],
      verificationBadges: ['Email', 'Phone', 'ID', 'Business License']
    }
  },
  4: {
    id: 4,
    firstName: 'Sarah',
    lastName: 'NewHost',
    email: 'newhost@smartstay.com',
    phone: '+1-555-0104',
    bio: 'New to hosting but excited to welcome guests!',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false
    }
  },
  5: {
    id: 5,
    firstName: 'Jane',
    lastName: 'Guest',
    email: 'guest@smartstay.com',
    phone: '+1-555-0105',
    bio: 'Travel enthusiast who loves exploring new places and meeting new people.',
    profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    preferences: {
      notifications: true,
      emailUpdates: false,
      smsAlerts: true
    },
    guestInfo: {
      memberSince: '2024-02-01',
      tripsCompleted: 12,
      reviewsReceived: 8,
      averageRating: 4.9
    }
  }
};

let messages = [
  {
    id: 1,
    conversationId: 'conv_1',
    senderId: 5, // Jane Guest
    receiverId: 3, // John Host
    propertyId: 1,
    bookingId: 1,
    message: 'Hi John! I\'m excited about my upcoming stay at your downtown apartment. Is early check-in possible?',
    timestamp: '2024-03-15T10:30:00.000Z',
    read: true
  },
  {
    id: 2,
    conversationId: 'conv_1',
    senderId: 3, // John Host
    receiverId: 5, // Jane Guest
    propertyId: 1,
    bookingId: 1,
    message: 'Hi Jane! Welcome! Yes, early check-in should be fine. I can have the apartment ready by 1 PM. Looking forward to hosting you!',
    timestamp: '2024-03-15T11:15:00.000Z',
    read: true
  },
  {
    id: 3,
    conversationId: 'conv_1',
    senderId: 5, // Jane Guest
    receiverId: 3, // John Host
    propertyId: 1,
    bookingId: 1,
    message: 'Perfect! Thank you so much. Also, could you recommend some good restaurants nearby?',
    timestamp: '2024-03-15T11:45:00.000Z',
    read: true
  },
  {
    id: 4,
    conversationId: 'conv_1',
    senderId: 3, // John Host
    receiverId: 5, // Jane Guest
    propertyId: 1,
    bookingId: 1,
    message: 'Absolutely! There\'s a great Italian place called "Bella Vista" just 2 blocks away, and "The Local Bistro" has amazing brunch. I\'ll send you a list with my welcome message!',
    timestamp: '2024-03-15T12:20:00.000Z',
    read: false
  },
  {
    id: 5,
    conversationId: 'conv_2',
    senderId: 1, // Admin
    receiverId: 3, // John Host
    message: 'Congratulations! Your host verification has been approved. You now have access to all host features.',
    timestamp: '2024-02-02T14:30:00.000Z',
    read: true
  }
];

let userNotifications = [
  {
    id: 1,
    userId: 3, // John Host
    type: 'booking_confirmed',
    title: 'New Booking Confirmed',
    message: 'Jane Guest has booked your Downtown Apartment for March 20-25.',
    read: false,
    createdAt: '2024-03-10T10:00:00.000Z'
  },
  {
    id: 2,
    userId: 3, // John Host
    type: 'payment_received',
    title: 'Payment Received',
    message: 'You\'ve received $727.50 for booking #1234.',
    read: true,
    createdAt: '2024-03-10T10:05:00.000Z'
  },
  {
    id: 3,
    userId: 5, // Jane Guest
    type: 'booking_reminder',
    title: 'Upcoming Trip Reminder',
    message: 'Your stay at Downtown Apartment starts in 3 days!',
    read: false,
    createdAt: '2024-03-17T09:00:00.000Z'
  },
  {
    id: 4,
    userId: 3, // John Host
    type: 'review_received',
    title: 'New Review Received',
    message: 'Jane Guest left you a 5-star review!',
    read: false,
    createdAt: '2024-02-16T10:00:00.000Z'
  }
];

// GET /api/users/profile - Get user profile
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const profile = userProfiles[userId];
  
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  
  res.json(profile);
});

// PUT /api/users/profile - Update user profile
router.put('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (!userProfiles[userId]) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  
  userProfiles[userId] = {
    ...userProfiles[userId],
    ...req.body
  };
  
  res.json({
    message: 'Profile updated successfully',
    profile: userProfiles[userId]
  });
});

// GET /api/users/messages - Get user messages
router.get('/messages', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const { conversationId } = req.query;
  
  let userMessages = messages.filter(m => 
    m.senderId === userId || m.receiverId === userId
  );
  
  if (conversationId) {
    userMessages = userMessages.filter(m => m.conversationId === conversationId);
  }
  
  // Group messages by conversation
  const conversations = {};
  userMessages.forEach(message => {
    if (!conversations[message.conversationId]) {
      conversations[message.conversationId] = [];
    }
    conversations[message.conversationId].push(message);
  });
  
  res.json({
    messages: userMessages,
    conversations,
    total: userMessages.length
  });
});

// POST /api/users/messages - Send new message
router.post('/messages', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const senderId = parseInt(token.split('_')[1]);
  
  const newMessage = {
    id: messages.length + 1,
    senderId,
    ...req.body,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  messages.push(newMessage);
  
  res.status(201).json({
    message: 'Message sent successfully',
    messageData: newMessage
  });
});

// GET /api/users/notifications - Get user notifications
router.get('/notifications', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  const { read } = req.query;
  
  let filteredNotifications = userNotifications.filter(n => n.userId === userId);
  
  if (read !== undefined) {
    filteredNotifications = filteredNotifications.filter(n => n.read === (read === 'true'));
  }
  
  res.json({
    notifications: filteredNotifications,
    total: filteredNotifications.length,
    unreadCount: userNotifications.filter(n => n.userId === userId && !n.read).length
  });
});

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', (req, res) => {
  const notificationId = parseInt(req.params.id);
  const notificationIndex = userNotifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  userNotifications[notificationIndex].read = true;
  
  res.json({
    message: 'Notification marked as read',
    notification: userNotifications[notificationIndex]
  });
});

// GET /api/users/:id/public - Get public user profile
router.get('/:id/public', (req, res) => {
  const userId = parseInt(req.params.id);
  const profile = userProfiles[userId];
  
  if (!profile) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return only public information
  const publicProfile = {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: profile.bio,
    profilePicture: profile.profilePicture,
    hostInfo: profile.hostInfo,
    guestInfo: profile.guestInfo
  };
  
  res.json(publicProfile);
});

// POST /api/users/settings - Update user settings
router.post('/settings', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const userId = parseInt(token.split('_')[1]);
  
  if (!userProfiles[userId]) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  userProfiles[userId].preferences = {
    ...userProfiles[userId].preferences,
    ...req.body
  };
  
  res.json({
    message: 'Settings updated successfully',
    preferences: userProfiles[userId].preferences
  });
});

module.exports = router;