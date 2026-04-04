import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostBookings = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1)); // February 2026
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch verification status when component mounts
    const fetchVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/host/verification-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(data);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  // Check if user is verified
  const isVerified = verificationStatus?.status === 'verified';

  // Extended bookings data with comprehensive guest information - only show for verified hosts
  const bookings = isVerified ? [
    {
      id: '17',
      unit: 'Trial#1',
      unitNumber: 1,
      guests: 2,
      totalPrice: '₱2,000',
      securityDeposit: '₱800',
      checkIn: '2/22/2026',
      checkOut: '2/24/2026',
      checkInDate: new Date(2026, 1, 22),
      checkOutDate: new Date(2026, 1, 24),
      contacts: {
        email: 'trial@gmail.com',
        phone: '09123456789'
      },
      guestInfo: {
        name: 'John Smith',
        age: 28,
        nationality: 'American',
        occupation: 'Software Engineer',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '09876543210',
          relationship: 'Spouse'
        }
      },
      bookingDetails: {
        purpose: 'Business Trip',
        arrivalTime: '2:00 PM',
        departureTime: '11:00 AM',
        transportation: 'Taxi',
        specialRequests: 'Late check-in, quiet room preferred',
        additionalServices: ['Airport pickup', 'Extra towels'],
        dietaryRestrictions: 'None',
        accessibility: 'None required',
        bookingType: 'fixed'
      },
      paymentInfo: {
        method: 'GCash',
        referenceNumber: 'GC123456789',
        transactionId: 'TXN123456789',
        paidAmount: '₱1,500',
        remainingBalance: '₱1,300',
        paymentDate: '2/20/2026',
        paymentTime: '2:30 PM',
        paymentProof: '/images/payment-proof-1.jpg'
      },
      priceBreakdown: {
        basePrice: 2000,
        guestFee: 500,
        timeSlotFee: 0,
        lateCheckOutFee: 0,
        total: 2500
      },
      status: 'confirmed',
      statusLabel: 'Confirmed - Payment Verified'
    },
    {
      id: '18',
      unit: 'Trial#2',
      unitNumber: 2,
      guests: 2,
      totalPrice: '₱2,000',
      securityDeposit: '₱800',
      checkIn: '2/23/2026',
      checkOut: '2/25/2026',
      checkInDate: new Date(2026, 1, 23),
      checkOutDate: new Date(2026, 1, 25),
      contacts: {
        email: 'maria.garcia@gmail.com',
        phone: '09123456789'
      },
      guestInfo: {
        name: 'Maria Garcia',
        age: 32,
        nationality: 'Filipino',
        occupation: 'Marketing Manager',
        emergencyContact: {
          name: 'Carlos Garcia',
          phone: '09876543211',
          relationship: 'Husband'
        }
      },
      bookingDetails: {
        purpose: 'Vacation',
        arrivalTime: '3:00 PM',
        departureTime: '10:00 AM',
        transportation: 'Private Car',
        specialRequests: 'Room with city view, early check-in if possible',
        additionalServices: ['Breakfast', 'Laundry service'],
        dietaryRestrictions: 'Vegetarian',
        accessibility: 'None required',
        bookingType: 'flexible'
      },
      paymentInfo: {
        method: 'GCash',
        referenceNumber: 'GC987654321',
        transactionId: 'TXN987654321',
        paidAmount: '₱750',
        remainingBalance: '₱1,750',
        paymentDate: '2/21/2026',
        paymentTime: '1:15 PM',
        paymentProof: '/images/payment-proof-2.jpg'
      },
      priceBreakdown: {
        basePrice: 2000,
        guestFee: 500,
        timeSlotFee: 0,
        lateCheckOutFee: 0,
        total: 2500
      },
      status: 'pending',
      statusLabel: 'Pending Payment Verification'
    },
    {
      id: '19',
      unit: 'Trial#3',
      unitNumber: 3,
      guests: 2,
      totalPrice: '₱2,000',
      securityDeposit: '₱800',
      checkIn: '2/26/2026',
      checkOut: '2/28/2026',
      checkInDate: new Date(2026, 1, 26),
      checkOutDate: new Date(2026, 1, 28),
      contacts: {
        email: 'david.lee@gmail.com',
        phone: '09123456789'
      },
      guestInfo: {
        name: 'David Lee',
        age: 35,
        nationality: 'Korean',
        occupation: 'Business Consultant',
        emergencyContact: {
          name: 'Sarah Lee',
          phone: '09876543212',
          relationship: 'Wife'
        }
      },
      bookingDetails: {
        purpose: 'Business Meeting',
        arrivalTime: '1:00 PM',
        departureTime: '12:00 PM',
        transportation: 'Uber',
        specialRequests: 'Need workspace area, strong WiFi connection',
        additionalServices: ['Room service', 'Business center access'],
        dietaryRestrictions: 'No seafood',
        accessibility: 'None required',
        bookingType: 'fixed'
      },
      paymentInfo: {
        method: 'GCash',
        referenceNumber: 'GC456789123',
        transactionId: 'TXN456789123',
        paidAmount: '₱2,500',
        remainingBalance: '₱0',
        paymentDate: '2/24/2026',
        paymentTime: '4:45 PM',
        paymentProof: '/images/payment-proof-3.jpg'
      },
      priceBreakdown: {
        basePrice: 2000,
        guestFee: 500,
        timeSlotFee: 0,
        lateCheckOutFee: 0,
        total: 2500
      },
      status: 'confirmed',
      statusLabel: 'Confirmed - Fully Paid',
      statusColor: 'Paid'
    },
    {
      id: '20',
      unit: 'Trial#1',
      unitNumber: 1,
      guests: 2,
      totalPrice: '₱2,000',
      securityDeposit: '₱800',
      checkIn: '2/25/2026',
      checkOut: '2/26/2026',
      checkInDate: new Date(2026, 1, 25),
      checkOutDate: new Date(2026, 1, 26),
      contacts: {
        email: 'anna.wilson@gmail.com',
        phone: '09123456789'
      },
      guestInfo: {
        name: 'Anna Wilson',
        age: 29,
        nationality: 'British',
        occupation: 'Travel Blogger',
        emergencyContact: {
          name: 'Tom Wilson',
          phone: '09876543213',
          relationship: 'Brother'
        }
      },
      bookingDetails: {
        purpose: 'Content Creation',
        arrivalTime: '4:00 PM',
        departureTime: '9:00 AM',
        transportation: 'Public Transport',
        specialRequests: 'Good lighting for photos, balcony access',
        additionalServices: ['Late checkout', 'Photography permission'],
        dietaryRestrictions: 'Gluten-free',
        accessibility: 'None required',
        bookingType: 'flexible'
      },
      paymentInfo: {
        method: 'GCash',
        referenceNumber: 'GC789123456',
        transactionId: 'TXN789123456',
        paidAmount: '₱1,000',
        remainingBalance: '₱1,500',
        paymentDate: '2/23/2026',
        paymentTime: '11:20 AM',
        paymentProof: '/images/payment-proof-4.jpg'
      },
      priceBreakdown: {
        basePrice: 2000,
        guestFee: 500,
        timeSlotFee: 0,
        lateCheckOutFee: 0,
        total: 2500
      },
      status: 'cancelled',
      statusLabel: 'Cancelled by Guest'
    }
  ] : []; // Empty array for unverified hosts

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.contacts.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Pending' && booking.status === 'pending') ||
                      (activeTab === 'Confirmed' && booking.status === 'confirmed');
    return matchesSearch && matchesTab;
  });

  const handleApprove = (bookingId) => {
    console.log(`Approving booking ${bookingId}`);
    // In real app, this would call an API
  };

  const handleReject = (bookingId) => {
    console.log(`Rejecting booking ${bookingId}`);
    // In real app, this would call an API
  };

  const handleViewGuest = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getBookingsForDate = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return bookings.filter(booking => {
      const checkIn = booking.checkInDate;
      const checkOut = booking.checkOutDate;
      return targetDate >= checkIn && targetDate < checkOut;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-400';
      case 'pending': return 'bg-yellow-400';
      case 'cancelled': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = getBookingsForDate(day);
      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1 relative">
          <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
          <div className="space-y-1">
            {dayBookings.map((booking, index) => (
              <div
                key={`${booking.id}-${index}`}
                className={`text-xs px-1 py-0.5 rounded text-white font-medium ${getStatusColor(booking.status)}`}
                title={`${booking.unit} - ${booking.status}`}
              >
                Unit {booking.unitNumber}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{getMonthName(currentDate)}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-sm text-gray-600">Confirmed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {dayNames.map(dayName => (
            <div key={dayName} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
              {dayName}
            </div>
          ))}
          {/* Calendar days */}
          {days}
        </div>
      </div>
    );
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">Manage all your property bookings</p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bars3Icon className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar View</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2">
          {['All', 'Pending', 'Confirmed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on view mode */}
        {viewMode === 'calendar' ? (
          renderCalendarView()
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                {/* Booking Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-900">
                      #{booking.id}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.guestInfo.name}</h3>
                      <p className="text-gray-600 text-sm">{booking.guestInfo.nationality}</p>
                    </div>
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                          {booking.statusLabel}
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                            {booking.statusLabel}
                          </span>
                          {booking.statusColor && (
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                              {booking.statusColor}
                            </span>
                          )}
                        </>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                          {booking.statusLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleViewGuest(booking.id)}
                      className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Guest Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Guest Name</p>
                      <p className="font-semibold text-gray-900">{booking.guestInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Nationality</p>
                      <p className="text-gray-900">{booking.guestInfo.nationality}</p>
                    </div>
                  </div>

                  {/* Unit & Guests */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Unit</p>
                      <p className="font-semibold text-gray-900">{booking.unit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Guests</p>
                      <p className="text-gray-900">{booking.guests}</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Price</p>
                      <p className="font-semibold text-gray-900 text-lg">{booking.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Security Deposit</p>
                      <p className="text-gray-900">{booking.securityDeposit}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Check-in</p>
                      <p className="font-semibold text-gray-900">{booking.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Check-out</p>
                      <p className="text-gray-900">{booking.checkOut}</p>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-gray-900 text-sm">{booking.contacts.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <p className="text-gray-900">{booking.contacts.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            {!isVerified ? (
              <>
                <div className="text-gray-400 mb-4">
                  <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings available</h3>
                <p className="text-gray-600 mb-6">Complete verification to start receiving bookings.</p>
                <a
                  href="/host/verification"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                >
                  <span>Complete Verification</span>
                </a>
              </>
            ) : (
              <>
                <div className="text-gray-400 mb-4">
                  <CalendarDaysIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </>
            )}
          </div>
        )}

        {/* Fixed Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-[#4E7B22] text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>
        </div>

        {/* Detailed Booking Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Booking #{selectedBooking.id}</h2>
                  <p className="text-gray-600 mt-1">Guest booking details</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Booking Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
                    <p className="text-sm text-gray-600">Current booking status and payment information</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedBooking.status === 'confirmed' 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : selectedBooking.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {selectedBooking.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Property & Guest Details */}
                  <div className="space-y-6">
                    {/* Property Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Property:</span>
                          <span className="font-medium">{selectedBooking.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-medium">{selectedBooking.checkIn} at {selectedBooking.bookingDetails.arrivalTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">{selectedBooking.checkOut} at {selectedBooking.bookingDetails.departureTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Guests:</span>
                          <span className="font-medium">{selectedBooking.guests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Type:</span>
                          <span className="font-medium capitalize">{selectedBooking.bookingDetails.bookingType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Purpose:</span>
                          <span className="font-medium">{selectedBooking.bookingDetails.purpose}</span>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedBooking.guestInfo.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span>{selectedBooking.guestInfo.age} years old</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nationality:</span>
                            <span>{selectedBooking.guestInfo.nationality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Occupation:</span>
                            <span>{selectedBooking.guestInfo.occupation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{selectedBooking.contacts.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{selectedBooking.contacts.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedBooking.guestInfo.emergencyContact.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{selectedBooking.guestInfo.emergencyContact.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Relationship:</span>
                            <span>{selectedBooking.guestInfo.emergencyContact.relationship}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests & Preferences */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-900">{selectedBooking.bookingDetails.specialRequests}</p>
                      </div>
                    </div>

                    {/* Additional Services */}
                    {selectedBooking.bookingDetails.additionalServices?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Services</h3>
                        <div className="space-y-2">
                          {selectedBooking.bookingDetails.additionalServices.map((service, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-900">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dietary & Accessibility */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Dietary Restrictions</h4>
                        <p className="text-sm text-gray-600">{selectedBooking.bookingDetails.dietaryRestrictions}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Accessibility Needs</h4>
                        <p className="text-sm text-gray-600">{selectedBooking.bookingDetails.accessibility}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Payment Details */}
                  <div className="space-y-6">
                    {/* Payment Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium font-mono">{selectedBooking.paymentInfo.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Date:</span>
                          <span className="font-medium">{selectedBooking.paymentInfo.paymentDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Time:</span>
                          <span className="font-medium">{selectedBooking.paymentInfo.paymentTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-medium">{selectedBooking.paymentInfo.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference Number:</span>
                          <span className="font-medium">{selectedBooking.paymentInfo.referenceNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Proof */}
                    {selectedBooking.paymentInfo.paymentProof && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h3>
                        <div className="border rounded-lg p-3 bg-gray-50">
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-600">Payment Screenshot</p>
                              <p className="text-xs text-gray-500 mt-1">Uploaded by guest</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Price:</span>
                          <span>₱{selectedBooking.priceBreakdown?.basePrice || selectedBooking.totalPrice.replace('₱', '')}</span>
                        </div>
                        {selectedBooking.priceBreakdown?.guestFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Guest Fee:</span>
                            <span>₱{selectedBooking.priceBreakdown.guestFee}</span>
                          </div>
                        )}
                        {selectedBooking.priceBreakdown?.timeSlotFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time Slot Fee:</span>
                            <span>₱{selectedBooking.priceBreakdown.timeSlotFee}</span>
                          </div>
                        )}
                        {selectedBooking.priceBreakdown?.lateCheckOutFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Late Check-out Fee:</span>
                            <span>₱{selectedBooking.priceBreakdown.lateCheckOutFee}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-base border-t pt-3">
                          <span>Total Amount:</span>
                          <span>₱{selectedBooking.priceBreakdown?.total || selectedBooking.totalPrice.replace('₱', '')}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Amount Paid:</span>
                          <span>{selectedBooking.paymentInfo.paidAmount}</span>
                        </div>
                        <div className="flex justify-between text-orange-600 font-semibold">
                          <span>Remaining Balance:</span>
                          <span>{selectedBooking.paymentInfo.remainingBalance}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Security Deposit:</span>
                          <span>{selectedBooking.securityDeposit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Transportation & Arrival Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Arrival Information</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transportation:</span>
                          <span className="font-medium">{selectedBooking.bookingDetails.transportation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Arrival:</span>
                          <span className="font-medium">{selectedBooking.checkIn} at {selectedBooking.bookingDetails.arrivalTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Departure:</span>
                          <span className="font-medium">{selectedBooking.checkOut} at {selectedBooking.bookingDetails.departureTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notes for Host */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Host Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Guest contact information is provided for check-in coordination</li>
                    <li>• Emergency contact should be used only in case of emergencies</li>
                    <li>• Payment verification status is shown above</li>
                    <li>• Special requests should be accommodated when possible</li>
                    {selectedBooking.paymentInfo.remainingBalance !== '₱0' && (
                      <li>• Remaining balance of {selectedBooking.paymentInfo.remainingBalance} to be collected at check-in</li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedBooking.id);
                          setShowDetailModal(false);
                        }}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve Booking
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedBooking.id);
                          setShowDetailModal(false);
                        }}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        Reject Booking
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostBookings;