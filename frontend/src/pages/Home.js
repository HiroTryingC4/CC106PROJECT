import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  CalendarDaysIcon,
  CreditCardIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showReportModal, setShowReportModal] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      text: 'Hello! Welcome to Smart Stay. I\'m here to help you with any questions or issues you may have.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: 'SS'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤'
      };
      
      setMessages([...messages, userMessage]);
      
      // Store message for admin to see
      const adminMessage = {
        id: Date.now(), // Use timestamp as unique ID
        from: 'guest@smartstay.com',
        fromName: 'Guest User',
        to: 'support@smartstay.com',
        subject: 'Guest Inquiry from Website',
        preview: newMessage.length > 100 ? newMessage.substring(0, 100) + '...' : newMessage,
        fullMessage: newMessage,
        timestamp: new Date().toLocaleString(),
        status: 'unread',
        priority: 'normal',
        category: 'general',
        userType: 'guest',
        repliedBy: null,
        repliedAt: null,
        replyStatus: 'pending',
        source: 'website_contact' // Mark as coming from website contact
      };
      
      // Get existing messages from localStorage
      const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      
      // Add new message to the beginning of the array (most recent first)
      const updatedMessages = [adminMessage, ...existingMessages];
      
      // Store back to localStorage
      localStorage.setItem('adminMessages', JSON.stringify(updatedMessages));
      
      setNewMessage('');
      
      // Auto-reply from support
      setTimeout(() => {
        const supportReply = {
          id: messages.length + 2,
          sender: 'support',
          text: 'Thank you for reaching out! I\'ve received your message and our support team will get back to you within 24 hours. Is there anything else I can help you with right now?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: 'SS'
        };
        setMessages(prev => [...prev, supportReply]);
      }, 1000);
    }
  };

  useEffect(() => {
    // Redirect authenticated users to their respective dashboards
    if (isAuthenticated && user) {
      if (user.role === 'guest') {
        navigate('/guest/dashboard');
      } else if (user.role === 'host') {
        navigate('/host/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        ></div>

        {/* Top-right Become a Host button */}
        <div className="absolute top-6 right-6 z-20">
          <Link 
            to="/register?type=host" 
            className="bg-gray-900/80 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-gray-800/90 transition-all flex items-center justify-center text-sm font-medium border border-gray-700/50"
          >
            Become a Host
          </Link>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
          <div className="text-center text-white px-4 max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Welcome to Smartstay
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
              Your Complete AI-Driven Property Management Solution for Intelligent Booking,
              Financial Analytics, and Seamless Guest experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto sm:max-w-none">
              <Link 
                to="/guest/search" 
                className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center text-sm sm:text-base"
              >
                <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Explore Properties
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-gray-900 px-6 sm:px-8 py-3 rounded-full hover:bg-gray-100 transition-all flex items-center justify-center text-sm sm:text-base"
              >
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              SmartStay combines cutting-edge AI technology with intuitive design to 
              deliver the ultimate management experience
            </p>
          </div>

          {/* For Guests Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-white font-medium px-4 py-2 rounded-full text-sm" style={{backgroundColor: '#4E7B22'}}>
                For Guest
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <MagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Smart Search & Filters</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Advanced search with filters for price, location, amenities, and more
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">AI Recommendations</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Personalized property suggestions based on your preferences and browsing history
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <CalendarDaysIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Real-Time Availability</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Check availability instantly with interactive calendar and instant booking
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Secure QR Payments</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Fast and secure payment processing with QR code technology
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Reviews & Ratings</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Share your experiences with photos and help others make informed decisions
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">24/7 AI Chatbot</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Get instant answers to your questions anytime, anywhere
                </p>
              </div>
            </div>
          </div>

          {/* For Hosts Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-white font-medium px-4 py-2 rounded-full text-sm" style={{backgroundColor: '#4E7B22'}}>
                For Hosts
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <BuildingOfficeIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Property Management</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Easily list, edit, and manage multiple properties with photos and details
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Track bookings, occupancy rates, revenue trends, and guest statistics
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <BanknotesIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Financial Dashboard</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Monitor revenue, expenses, payroll, and calculate net profit automatically
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <DocumentChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Expense Tracking</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Track all property expenses by category with detailed reports
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Custom Reports</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Generate detailed financial and booking reports with export options
                </p>
              </div>
              
              <div className="p-4 sm:p-6 rounded-lg" style={{backgroundColor: '#f0f9f0'}}>
                <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 mb-3 sm:mb-4" style={{color: '#4E7B22'}} />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Flexible Time Units</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Set customizable work hours, track time logs, and manage shift-based schedules with ease
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-12 sm:py-16 text-white" style={{backgroundColor: '#4E7B22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Powered by Artificial Intelligence</h2>
            <p className="text-lg sm:text-xl opacity-90 px-4">
              Experience the future of property management with our AI-driven features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 rounded-lg" style={{backgroundColor: 'rgba(34, 88, 8, 0.5)'}}>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Smart Recommendations</h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                Our Machine Learning algorithms analyze user preferences, past booking patterns, and suggest optimal property selections
              </p>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>• Personalized match scores</li>
                <li>• Dynamic pricing suggestions</li>
                <li>• Optimal property selection</li>
              </ul>
            </div>

            <div className="p-6 sm:p-8 rounded-lg" style={{backgroundColor: 'rgba(34, 88, 8, 0.5)'}}>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Intelligent Chatbot</h3>
              <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                Advanced conversational AI powered chatbot. Instant responses, smart answers and suggestions, and seamless booking assistance
              </p>
              <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>• Natural language understanding</li>
                <li>• Context-aware responses</li>
                <li>• Real-time availability checks</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 text-white" style={{backgroundColor: '#4E7B22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Trusted by Thousands</h2>
            <p className="text-lg sm:text-xl opacity-90 px-4">
              Join our growing community of hosts and guests
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-lg" style={{backgroundColor: 'rgba(34, 88, 8, 0.5)'}}>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">1,000+</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">Properties Listed</div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg" style={{backgroundColor: 'rgba(34, 88, 8, 0.5)'}}>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">5,000+</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">Happy Guests</div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg" style={{backgroundColor: 'rgba(34, 88, 8, 0.5)'}}>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">500+</div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">Verified Hosts</div>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg" style={{backgroundColor: 'rgba(34, 88, 8, 0.5)'}}>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 flex items-center justify-center">
                4.8 <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 ml-1" />
              </div>
              <div className="text-sm sm:text-base lg:text-lg opacity-90">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">How SmartStay Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">Get started in just a few simple steps</p>
          </div>

          {/* For Guests */}
          <div className="mb-12 sm:mb-16">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900">For Guests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>1</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Browse Properties</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Search and filter through curated selection</p>
              </div>
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>2</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Select Dates</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Check availability and choose your dates</p>
              </div>
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>3</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Book & Pay</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Secure booking with QR code payment</p>
              </div>
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>4</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Enjoy Your Stay</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Check-in and have a wonderful experience</p>
              </div>
            </div>
          </div>

          {/* For Hosts */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900">For Hosts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>1</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">List Property</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Add photos, details, and amenities</p>
              </div>
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>2</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Get Verified</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Complete verification process</p>
              </div>
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>3</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Receive Bookings</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Accept or manage booking requests</p>
              </div>
              <div className="text-center">
                <div className="text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-3 sm:mb-4" style={{backgroundColor: '#4E7B22'}}>4</div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Earn Income</h4>
                <p className="text-gray-600 text-xs sm:text-sm">Track earnings and manage finances</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{backgroundColor: '#4E7B22'}}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          </div>

          {/* Featured Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: 'Luxury Beachfront Condo',
                type: 'CONDO',
                description: 'Stunning 2-bedroom condo with ocean views, modern amenities, and direct beach access.',
                price: '₱5000',
                period: '/night',
                details: '2 bed • 2 bath • 4 guests',
                rating: 4.9,
                reviews: 98,
                image: '/images/beachfront-condo.jpg',
                imageGradient: 'from-orange-400 to-orange-600',
                typeColor: 'text-green-700',
                typeBg: 'bg-green-100'
              },
              {
                id: 2,
                title: 'Modern Downtown Studio',
                type: 'STUDIO',
                description: 'Cozy studio apartment in the heart of downtown, perfect for business travelers.',
                price: '₱1500',
                period: '/night',
                details: '1 bed • 1 bath • 2 guests',
                rating: 4.5,
                reviews: 28,
                image: '/images/downtown-studio.jpg',
                imageGradient: 'from-gray-400 to-gray-600',
                typeColor: 'text-green-700',
                typeBg: 'bg-green-100'
              },
              {
                id: 3,
                title: 'Family-Friendly Villa',
                type: 'VILLA',
                description: 'Spacious 3-bedroom villa with private pool, perfect for families.',
                price: '₱3000',
                period: '/night',
                details: '3 bed • 3 bath • 6 guests',
                rating: 4.8,
                reviews: 156,
                image: '/images/family-villa.jpg',
                imageGradient: 'from-green-400 to-green-600',
                typeColor: 'text-green-700',
                typeBg: 'bg-green-100'
              }
            ].map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                onClick={() => navigate(`/guest/units/${property.id}`)}
              >
                {/* Property Image */}
                <div className="h-64 relative rounded-t-lg overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${property.imageGradient} bg-black bg-opacity-20 rounded-t-lg hidden`} style={{zIndex: 1}}></div>
                </div>
                
                <div className="p-6">
                  {/* Property Type Badge and Rating */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${property.typeBg} ${property.typeColor} flex items-center space-x-2`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                      <span>{property.type}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-lg font-bold text-gray-900">{property.rating}</span>
                      <span className="text-gray-600">({property.reviews})</span>
                    </div>
                  </div>

                  {/* Property Title with underline */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                    <div className="w-16 h-1 bg-green-500 rounded"></div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-base mb-6 leading-relaxed">{property.description}</p>
                  
                  {/* Price and Details */}
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-green-600">{property.price}</span>
                      <span className="text-gray-600">{property.period}</span>
                    </div>
                    <div className="text-gray-600">{property.details}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-8">
            <Link 
              to="/guest/units" 
              className="inline-block text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-all"
              style={{backgroundColor: '#4E7B22'}}
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 text-white" style={{backgroundColor: '#4E7B22'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 px-4">
            Join thousands of satisfied users and experience the future of property management
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 max-w-lg mx-auto sm:max-w-none">
            <Link 
              to="/guest/search" 
              className="bg-white px-6 sm:px-8 py-3 rounded-full hover:bg-gray-100 transition-all flex items-center justify-center text-sm sm:text-base"
              style={{color: '#4E7B22'}}
            >
              <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Explore Properties
            </Link>
            <Link 
              to="/host/register" 
              className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 rounded-full hover:bg-white transition-all flex items-center justify-center text-sm sm:text-base"
              style={{'--hover-color': '#4E7B22'}}
              onMouseEnter={(e) => e.target.style.color = '#4E7B22'}
              onMouseLeave={(e) => e.target.style.color = 'white'}
            >
              <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Explore Properties
            </Link>
          </div>

          <div className="text-xs sm:text-sm opacity-75 space-y-1 sm:space-y-2 px-4">
            <p>No credit card required • Free to browse • Instant booking</p>
            <p>Have questions? Check out FAQ</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-8 sm:py-12" style={{backgroundColor: '#0C1805'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Smart Stay</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Your trusted platform for booking amazing properties with ease and confidence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/units" className="hover:text-white transition-colors">Browse Units</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <div className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base mb-6">
                <p>Email: info@smartstay.com</p>
                <p>Phone: +1 (234) 567-8900</p>
                <p>Address: 123 Main St, City, State</p>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-[#4E7B22] text-white hover:bg-green-600 transition-colors px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Report Issue / Contact Admin</span>
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; 2024 Smart Stay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Messages Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full h-[700px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4E7B22] rounded-full flex items-center justify-center text-white font-bold">
                  SS
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Stay Support</h3>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.sender === 'support' ? (
                      // Support message (left side)
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-[#4E7B22] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          SS
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3 shadow-sm border">
                            <p className="text-gray-800 text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-1">{message.time}</p>
                        </div>
                      </div>
                    ) : (
                      // User message (right side)
                      <div className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="bg-[#4E7B22] text-white rounded-lg p-3 shadow-sm">
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right mr-1">{message.time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-[#4E7B22] text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setNewMessage('I have a booking issue with my reservation')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  Booking Issue
                </button>
                <button
                  onClick={() => setNewMessage('I need help with payment processing')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  Payment Help
                </button>
                <button
                  onClick={() => setNewMessage('I have a question about property amenities')}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                >
                  Property Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;