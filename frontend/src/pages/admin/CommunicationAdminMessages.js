import React, { useState } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  TrashIcon,
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(null);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! I'm your smart assistant. How can I help you today?");
  const [fallbackMessage, setFallbackMessage] = useState("I'm not sure I understand that. Could you rephrase that?");
  const [responseDelay, setResponseDelay] = useState(3000);

  const [faqs, setFaqs] = useState([]);

  // Load FAQs from localStorage
  React.useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = () => {
    console.log('Communication Admin: Loading FAQs...');
    const defaultFaqs = [
      // General FAQs
      {
        id: 1,
        category: "General",
        question: "What is Smart Stay?",
        answer: "Smart Stay is an AI-driven web-based platform for intelligent property booking and host financial management. We provide smart recommendations, automated chatbot support, and comprehensive analytics for both guests and hosts."
      },
      {
        id: 2,
        category: "General",
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button on our homepage. Choose whether you want to register as a guest or host, fill in your details, and verify your email address to get started."
      },
      {
        id: 3,
        category: "General",
        question: "Is Smart Stay free to use?",
        answer: "Yes, Smart Stay is free to browse and search properties. Guests can create accounts and browse listings at no cost. Hosts can list their first property for free, with optional premium features available for enhanced visibility and analytics."
      },
      {
        id: 4,
        category: "General",
        question: "What makes Smart Stay different from other booking platforms?",
        answer: "Smart Stay uses advanced AI technology to provide personalized property recommendations, automated customer support through our intelligent chatbot, comprehensive financial analytics for hosts, and seamless QR code payment processing for secure transactions."
      },
      
      // Guest FAQs
      {
        id: 5,
        category: "Guests FAQ",
        question: "How can I book a property?",
        answer: "To book a property: 1) Browse available properties using our search filters, 2) Select your desired dates and number of guests, 3) Review property details and host information, 4) Complete the booking form with your details, 5) Make payment using our secure QR code system."
      },
      {
        id: 6,
        category: "Guests FAQ",
        question: "Can I browse properties without an account?",
        answer: "Yes, you can browse all available properties, view photos, read descriptions, and check availability without creating an account. However, you'll need to create a free account to make bookings and access personalized recommendations."
      },
      {
        id: 7,
        category: "Guests FAQ",
        question: "How does the AI recommendation system work?",
        answer: "Our AI recommendation system analyzes your browsing history, previous bookings, preferences, and search patterns to suggest properties that match your interests. The more you use Smart Stay, the better our recommendations become."
      },
      {
        id: 8,
        category: "Guests FAQ",
        question: "What payment methods do you accept?",
        answer: "We accept payments via QR code technology supporting major payment platforms including GCash, PayMaya, and bank transfers. After booking confirmation, you'll receive a secure QR code to complete your payment."
      }
    ];

    try {
      // Get FAQs from localStorage
      const storedFaqs = JSON.parse(localStorage.getItem('smartStayFaqs') || '[]');
      console.log('Communication Admin: Found stored FAQs:', storedFaqs.length);
      
      // If no stored FAQs, use default ones and store them
      if (storedFaqs.length === 0) {
        console.log('Communication Admin: Initializing default FAQs');
        localStorage.setItem('smartStayFaqs', JSON.stringify(defaultFaqs));
        setFaqs(defaultFaqs);
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('faqsUpdated'));
      } else {
        setFaqs(storedFaqs);
      }
    } catch (error) {
      console.error('Communication Admin: Error loading FAQs:', error);
      setFaqs(defaultFaqs);
      localStorage.setItem('smartStayFaqs', JSON.stringify(defaultFaqs));
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('faqsUpdated'));
    }
  };

  const [messages, setMessages] = useState([]);

  // Load messages from localStorage and merge with static messages
  React.useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    const staticMessages = [
      {
        id: 1,
        from: 'guest.trial@smartstay.com',
        fromName: 'Jess Trial (Guest)',
        to: 'support@smartstay.com',
        subject: 'Question about booking cancellation',
        preview: 'Hi, I need to cancel my booking for next week due to an emergency. What is the cancellation policy and will I get a refund?',
        fullMessage: 'Hi Support Team,\n\nI hope this message finds you well. I need to cancel my booking for the Luxury Beachfront Condo (Booking #12345) scheduled for next week due to a family emergency.\n\nCould you please let me know:\n1. What is your cancellation policy?\n2. Will I be eligible for a refund?\n3. How long does the refund process take?\n\nI apologize for the short notice and appreciate your understanding.\n\nBest regards,\nJess Trial',
        timestamp: '2024-03-15 14:30:25',
        status: 'unread',
        priority: 'normal',
        category: 'booking',
        userType: 'guest',
        repliedBy: null,
        repliedAt: null,
        replyStatus: 'pending'
      },
      {
        id: 2,
        from: 'john.guest@example.com',
        fromName: 'John Smith (Guest)',
        to: 'support@smartstay.com',
        subject: 'Payment issue with my booking',
        preview: 'I tried to complete payment for my booking but the QR code is not working...',
        fullMessage: 'Hello,\n\nI am trying to complete payment for my booking (Booking #67890) but I am having issues with the QR code payment system. The code appears to be invalid or expired.\n\nCould you please help me resolve this issue? I need to complete the payment today to secure my reservation.\n\nThank you for your assistance.\n\nJohn Smith\nPhone: +1234567890',
        timestamp: '2024-03-15 13:45:12',
        status: 'unread',
        priority: 'high',
        category: 'payment',
        userType: 'guest',
        repliedBy: 'adm1',
        repliedAt: '2024-03-15 15:20:30',
        replyStatus: 'replied'
      },
      {
        id: 3,
        from: 'sarah.host@example.com',
        fromName: 'Sarah Wilson (Host)',
        to: 'support@smartstay.com',
        subject: 'Guest communication issue',
        preview: 'I am having trouble communicating with my guest about check-in details...',
        fullMessage: 'Dear Support Team,\n\nI am having difficulty communicating with my guest (Booking #11111) about check-in details. They are not responding to my messages through the platform.\n\nThe guest is supposed to check in tomorrow and I need to provide them with:\n- Access codes\n- Parking instructions\n- House rules\n\nCould you please help facilitate this communication or provide an alternative contact method?\n\nThank you,\nSarah Wilson\nProperty: Downtown Apartment',
        timestamp: '2024-03-15 12:20:33',
        status: 'read',
        priority: 'urgent',
        category: 'communication',
        userType: 'host',
        repliedBy: null,
        repliedAt: null,
        replyStatus: 'pending'
      },
      {
        id: 4,
        from: 'mike.guest@example.com',
        fromName: 'Mike Johnson (Guest)',
        to: 'support@smartstay.com',
        subject: 'Request for additional amenities',
        preview: 'Can I request additional towels and pillows for my stay?',
        fullMessage: 'Hi there,\n\nI am currently staying at the Mountain View Cabin (Booking #22222) and would like to request some additional amenities:\n\n- 2 extra towels\n- 1 additional pillow\n- Information about local restaurants\n\nThe property is beautiful and I am enjoying my stay. Just need these small additions to make it perfect.\n\nPlease let me know if this is possible and how to arrange it.\n\nBest regards,\nMike Johnson\nRoom: Mountain View Cabin',
        timestamp: '2024-03-15 11:15:45',
        status: 'read',
        priority: 'low',
        category: 'amenities',
        userType: 'guest',
        repliedBy: 'adm2',
        repliedAt: '2024-03-15 14:45:12',
        replyStatus: 'replied'
      },
      {
        id: 5,
        from: 'emma.guest@example.com',
        fromName: 'Emma Davis (Guest)',
        to: 'support@smartstay.com',
        subject: 'Feedback and compliments',
        preview: 'I wanted to share my wonderful experience at your property...',
        fullMessage: 'Dear Smart Stay Team,\n\nI just completed my stay at the Seaside Villa and wanted to share my feedback. The experience was absolutely wonderful!\n\nHighlights of my stay:\n- Immaculate cleanliness\n- Beautiful ocean view\n- Responsive host communication\n- Great location near restaurants\n- All amenities as described\n\nI will definitely be booking with Smart Stay again and recommending to friends and family.\n\nThank you for providing such excellent service!\n\nWarm regards,\nEmma Davis\nStay dates: March 10-14, 2024',
        timestamp: '2024-03-15 10:30:15',
        status: 'read',
        priority: 'normal',
        category: 'feedback',
        userType: 'guest',
        repliedBy: null,
        repliedAt: null,
        replyStatus: 'pending'
      }
    ];

    // Get messages from localStorage
    const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    
    // Merge stored messages with static messages (stored messages first as they're more recent)
    const allMessages = [...storedMessages, ...staticMessages];
    
    setMessages(allMessages);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-gray-100 text-gray-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'communication': return 'bg-purple-100 text-purple-800';
      case 'amenities': return 'bg-yellow-100 text-yellow-800';
      case 'feedback': return 'bg-pink-100 text-pink-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'property': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'guest': return 'bg-green-100 text-green-800';
      case 'host': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReplyStatusColor = (replyStatus) => {
    switch (replyStatus) {
      case 'replied': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReplyToGuest = () => {
    if (selectedMessage) {
      setShowReplyModal(true);
    }
  };

  const handleSendReply = () => {
    if (replyMessage.trim()) {
      // Get current admin number based on user email or role
      const getAdminNumber = (user) => {
        if (user?.email === 'comm-admin@smartstay.com') return 'adm1';
        if (user?.email === 'comm-admin2@smartstay.com') return 'adm2';
        // Default fallback based on user name or generate number
        return user?.firstName === 'Admin 1' ? 'adm1' : 'adm2';
      };
      
      const adminLabel = getAdminNumber(user);
      const currentTime = new Date().toLocaleString();
      
      // Handle sending reply to guest
      alert(`Reply sent to ${selectedMessage?.fromName || 'guest'}: "${replyMessage}"`);
      
      // Update message status to show it was replied to
      const updatedMessages = messages.map(message =>
        message.id === selectedMessage.id
          ? {
              ...message,
              replyStatus: 'replied',
              repliedBy: adminLabel,
              repliedAt: currentTime,
              status: 'read'
            }
          : message
      );
      
      setMessages(updatedMessages);
      
      // Update localStorage if this message came from website contact
      if (selectedMessage.source === 'website_contact') {
        const storedMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
        const updatedStoredMessages = storedMessages.map(message =>
          message.id === selectedMessage.id
            ? {
                ...message,
                replyStatus: 'replied',
                repliedBy: adminLabel,
                repliedAt: currentTime,
                status: 'read'
              }
            : message
        );
        localStorage.setItem('adminMessages', JSON.stringify(updatedStoredMessages));
      }
      
      setReplyMessage('');
      setShowReplyModal(false);
    }
  };

  const handleMarkAsRead = () => {
    if (selectedMessage) {
      alert(`Message "${selectedMessage.subject}" marked as read`);
      setSelectedMessage(null);
    }
  };

  const handleForward = () => {
    if (selectedMessage) {
      alert(`Message "${selectedMessage.subject}" forwarded`);
      setSelectedMessage(null);
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      if (window.confirm(`Are you sure you want to delete the message "${selectedMessage.subject}"?`)) {
        alert(`Message "${selectedMessage.subject}" deleted`);
        setSelectedMessage(null);
      }
    }
  };

  const handleAskCopilot = (message) => {
    const prompt = `Help me draft a professional reply to this guest message:\n\nSubject: ${message.subject}\nFrom: ${message.fromName}\nMessage: ${message.preview}\n\nPlease suggest a helpful and professional response.`;
    alert(`AI Copilot suggests:\n\n"Thank you for reaching out. I understand your concern about ${message.category}. Let me help you with this right away. I'll review your request and get back to you within 2 hours with a detailed response and next steps."\n\nWould you like to use this suggestion or modify it?`);
    setShowQuickActions(null);
  };

  const handleCopyMessage = (message) => {
    const textToCopy = `Subject: ${message.subject}\nFrom: ${message.fromName}\nDate: ${message.timestamp}\n\nMessage:\n${message.fullMessage || message.preview}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Message copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy message');
    });
    setShowQuickActions(null);
  };

  const handleSearchMessage = (message) => {
    setSearchTerm(message.fromName);
    setShowQuickActions(null);
  };

  const handleAddFaq = (e) => {
    e.preventDefault();
    
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert('Please fill in both question and answer fields');
      return;
    }

    const newFaqItem = {
      id: Date.now(), // Use timestamp for unique ID
      category: newFaq.category,
      question: newFaq.question.trim(),
      answer: newFaq.answer.trim()
    };

    const updatedFaqs = [...faqs, newFaqItem];
    setFaqs(updatedFaqs);
    
    // Save to localStorage
    localStorage.setItem('smartStayFaqs', JSON.stringify(updatedFaqs));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('faqsUpdated'));
    
    setNewFaq({ question: '', answer: '', category: 'General' });
    setShowAddFaqModal(false);
    alert('FAQ added successfully!');
  };

  const handleDeleteFaq = (faqId) => {
    const faqToDelete = faqs.find(f => f.id === faqId);
    if (window.confirm(`Are you sure you want to delete the FAQ: "${faqToDelete.question}"?`)) {
      const updatedFaqs = faqs.filter(f => f.id !== faqId);
      setFaqs(updatedFaqs);
      
      // Save to localStorage
      localStorage.setItem('smartStayFaqs', JSON.stringify(updatedFaqs));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('faqsUpdated'));
      
      alert('FAQ deleted successfully!');
    }
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Communication Center</h2>
          <p className="text-gray-600 mt-2">Manage guest messages and chatbot settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 Guest Messages
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chatbot'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤖 Chatbot Management
            </button>
          </nav>
        </div>

        {/* Messages Tab Content */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{messages.length}</p>
                <p className="text-sm text-green-600 mt-1">All conversations</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Unread Messages</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{messages.filter(m => m.status === 'unread').length}</p>
                <p className="text-sm text-green-600 mt-1">Needs attention</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Guest Messages</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{messages.filter(m => m.userType === 'guest').length}</p>
                <p className="text-sm text-blue-600 mt-1">From guests</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">2.4h</p>
                <p className="text-sm text-green-600 mt-1">Average</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages by sender, subject, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                  <button
                    onClick={loadMessages}
                    className="px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedMessage(message)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{message.fromName}</span>
                              <span className="text-gray-500">→</span>
                              <span className="text-gray-600">Communication Center</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                                {message.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(message.category)}`}>
                                {message.category}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(message.userType)}`}>
                                {message.userType}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReplyStatusColor(message.replyStatus)}`}>
                                {message.replyStatus}
                              </span>
                              {message.source === 'website_contact' && (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center space-x-1">
                                  <span>🌐</span>
                                  <span>Website</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.subject}</h3>
                        <p className="text-gray-600 mb-3">{message.preview}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {message.timestamp}
                          </div>
                          
                          {message.replyStatus === 'replied' && (
                            <div className="flex items-center text-sm text-green-600">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              <span>Replied by {message.repliedBy} at {message.repliedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => setSelectedMessage(message)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowQuickActions(showQuickActions === message.id ? null : message.id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                          
                          {/* Quick Actions Dropdown */}
                          {showQuickActions === message.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <button
                                onClick={() => handleAskCopilot(message)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <SparklesIcon className="w-4 h-4 text-blue-500" />
                                <span>Ask Copilot</span>
                              </button>
                              <button
                                onClick={() => handleCopyMessage(message)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => handleSearchMessage(message)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
                                <span>Search</span>
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  setSelectedMessage(message);
                                  setShowReplyModal(true);
                                  setShowQuickActions(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center space-x-2"
                              >
                                <PaperAirplaneIcon className="w-4 h-4 text-green-500" />
                                <span>Quick Reply</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete message "${message.subject}"?`)) {
                                    alert(`Message "${message.subject}" deleted`);
                                    setShowQuickActions(null);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <TrashIcon className="w-4 h-4 text-red-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {filteredMessages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Chatbot Tab Content */}
        {activeTab === 'chatbot' && (
          <div className="space-y-6">{/* Chatbot Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Chatbot Management</h3>
              <p className="text-gray-600 mt-1">Manage the Smart Stay Assistant chatbot</p>
            </div>
            <button 
              onClick={() => navigate('/comm-admin/chatbot-analytics')}
              className="bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics & Monitoring</span>
            </button>
          </div>

          {/* Chatbot Configuration */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Chatbot Configuration</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableChatbot"
                  checked={chatbotEnabled}
                  onChange={(e) => setChatbotEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#4E7B22] border-gray-300 rounded focus:ring-[#4E7B22]"
                />
                <label htmlFor="enableChatbot" className="text-sm font-medium text-gray-900">
                  ✓ Enable Chatbot
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  placeholder="Hello! I'm your smart assistant. How can I help you today?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fallback Message</label>
                <input
                  type="text"
                  value={fallbackMessage}
                  onChange={(e) => setFallbackMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  placeholder="I'm not sure I understand that. Could you rephrase that?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Delay (ms)</label>
                <input
                  type="number"
                  value={responseDelay}
                  onChange={(e) => setResponseDelay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                  placeholder="3000"
                />
              </div>

              <button className="bg-[#4E7B22] text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Save Configuration
              </button>
            </div>
          </div>

          {/* FAQ Management */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h4>
                <p className="text-sm text-gray-600 mt-1">These FAQs appear on the public FAQ page for all visitors</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={loadFaqs}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => setShowAddFaqModal(true)}
                  className="bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>ADD FAQ</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>📝 Note:</strong> FAQs you add here will automatically appear on the public FAQ page at <code>/faqs</code> for all website visitors.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No FAQs added yet. Click "ADD FAQ" to create your first FAQ.</p>
                </div>
              ) : (
                faqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-[#4E7B22] rounded-full flex items-center justify-center text-xs font-medium text-white">
                          {faqs.indexOf(faq) + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{faq.question}</h5>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {faq.category || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-800 text-sm">Edit</button>
                        <button 
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm ml-8">{faq.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h3>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">From:</span>
                  <span className="text-gray-600">{selectedMessage.fromName}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">To:</span>
                  <span className="text-gray-600">Communication Center</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">Time:</span>
                  <span className="text-gray-600">{selectedMessage.timestamp}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedMessage.category)}`}>
                    {selectedMessage.category}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(selectedMessage.userType)}`}>
                    {selectedMessage.userType}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Message Content:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedMessage.fullMessage || selectedMessage.preview}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t">
                  <button 
                    onClick={handleReplyToGuest}
                    className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 font-medium text-sm"
                  >
                    Reply to Guest
                  </button>
                  <button 
                    onClick={handleMarkAsRead}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 font-medium text-sm"
                  >
                    Mark as Read
                  </button>
                  <button 
                    onClick={handleForward}
                    className="bg-gray-600 text-white px-6 py-3 rounded-2xl hover:bg-gray-700 font-medium text-sm"
                  >
                    Forward
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Reply to {selectedMessage.fromName}</h3>
                <button 
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Original Message Context */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Original Message:</h4>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {selectedMessage.subject}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>From:</strong> {selectedMessage.fromName}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Date:</strong> {selectedMessage.timestamp}
                </div>
                <div className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-500">
                  {selectedMessage.fullMessage || selectedMessage.preview}
                </div>
              </div>

              {/* Reply Form */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Your Reply</label>
                    <button
                      onClick={() => {
                        const suggestion = `Thank you for reaching out regarding ${selectedMessage.category}. I understand your concern and I'm here to help. Let me review your request and provide you with a detailed response shortly. If you have any urgent questions, please don't hesitate to contact us directly.`;
                        setReplyMessage(suggestion);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>Ask Copilot</span>
                    </button>
                  </div>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply to the guest here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    className="bg-[#4E7B22] text-white px-6 py-3 rounded-2xl hover:bg-green-700 font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyMessage('');
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add FAQ Modal */}
        {showAddFaqModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Add New FAQ</h3>
                <button 
                  onClick={() => {
                    setShowAddFaqModal(false);
                    setNewFaq({ question: '', answer: '', category: 'General' });
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddFaq} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Guests FAQ">Guests FAQ</option>
                    <option value="Hosts FAQ">Hosts FAQ</option>
                    <option value="Booking">Booking</option>
                    <option value="Payment">Payment</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                    placeholder="Enter the frequently asked question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                    placeholder="Enter the detailed answer to this question..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent resize-none"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Good FAQs:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Keep questions clear and specific</li>
                    <li>• Provide complete and helpful answers</li>
                    <li>• Use simple language that guests can understand</li>
                    <li>• Include relevant details like timeframes or contact info</li>
                  </ul>
                </div>
                
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="bg-[#4E7B22] text-white px-6 py-3 rounded-2xl hover:bg-green-700 font-medium text-sm flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add FAQ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFaqModal(false);
                      setNewFaq({ question: '', answer: '', category: 'General' });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminMessages;