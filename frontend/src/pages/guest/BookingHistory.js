import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('List'); // List or Calendar

  const bookings = [
    {
      id: 'Booking #17',
      checkIn: '2/23/2026',
      checkOut: '2/24/2026',
      guests: 1,
      totalPrice: '₱150',
      status: 'pending',
      statusColor: 'bg-yellow-100 text-yellow-800',
      statusBadge: 'pending'
    },
    {
      id: 'Booking #16',
      checkIn: '2/25/2026',
      checkOut: '2/26/2026',
      guests: 1,
      totalPrice: '₱150',
      status: 'pending',
      statusColor: 'bg-yellow-100 text-yellow-800',
      statusBadge: 'pending'
    },
    {
      id: 'Booking #13',
      checkIn: '3/9/2026',
      checkOut: '3/10/2026',
      guests: 1,
      totalPrice: '₱150',
      status: 'confirmed',
      statusColor: 'bg-green-100 text-green-800',
      statusBadge: 'confirmed'
    },
    {
      id: 'Booking #13',
      checkIn: '3/12/2026',
      checkOut: '3/13/2026',
      guests: 1,
      totalPrice: '₱150',
      status: 'confirmed',
      statusColor: 'bg-green-100 text-green-800',
      statusBadge: 'confirmed'
    },
    {
      id: 'Booking #3',
      checkIn: '5/1/2024',
      checkOut: '5/5/2024',
      guests: 1,
      totalPrice: '₱540',
      status: 'completed',
      statusColor: 'bg-blue-100 text-blue-800',
      statusBadge: 'completed'
    }
  ];

  const getFilteredBookings = () => {
    if (activeTab === 'All') return bookings;
    if (activeTab === 'Upcoming') return bookings.filter(b => b.status === 'confirmed');
    if (activeTab === 'Pending') return bookings.filter(b => b.status === 'pending');
    if (activeTab === 'Past') return bookings.filter(b => b.status === 'completed');
    return bookings;
  };

  const tabs = ['All', 'Upcoming', 'Pending', 'Past'];

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{backgroundColor: '#4E7B22'}}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">View and manage your bookings</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('List')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                viewMode === 'List' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
              <span>List</span>
            </button>
            <button 
              onClick={() => setViewMode('Calendar')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                viewMode === 'Calendar' 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={activeTab === tab ? {backgroundColor: '#4E7B22'} : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content - List or Calendar View */}
        {viewMode === 'List' ? (
          /* Bookings List */
          <div className="space-y-4">
            {getFilteredBookings().map((booking, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  {/* Left Side - Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{booking.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.statusBadge}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      {/* Check-in */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Check-in</h4>
                        <p className="text-gray-600">{booking.checkIn}</p>
                      </div>

                      {/* Check-out */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Check-out</h4>
                        <p className="text-gray-600">{booking.checkOut}</p>
                      </div>

                      {/* Guest */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Guest</h4>
                        <p className="text-gray-600">{booking.guests}</p>
                      </div>

                      {/* Total Price */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Total Price</h4>
                        <p className="text-blue-600 font-semibold">{booking.totalPrice}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Action Button */}
                  <div>
                    <button 
                      onClick={() => navigate(`/guest/bookings/${booking.id.replace('Booking #', '')}`)}
                      className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90" 
                      style={{backgroundColor: '#4E7B22'}}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Calendar View */
          <CalendarView bookings={getFilteredBookings()} navigate={navigate} />
        )}

        {/* Empty State */}
        {getFilteredBookings().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-1a4 4 0 014-4h4a4 4 0 014 4v1a4 4 0 11-8 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">You don't have any bookings in this category yet.</p>
          </div>
        )}

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button className="text-white p-4 rounded-full shadow-lg hover:opacity-90 flex items-center space-x-2" style={{backgroundColor: '#4E7B22'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chat</span>
          </button>
        </div>
      </div>
    </GuestLayout>
  );
};

// Calendar View Component
const CalendarView = ({ bookings, navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDateForComparison = (date) => {
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear().toString();
    return `${month}/${day}/${year}`;
  };
  
  const parseBookingDate = (dateStr) => {
    // Parse dates like "2/23/2026" or "3/29/2026"
    const [month, day, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };
  
  const getBookingForDate = (date) => {
    const dateStr = formatDateForComparison(date);
    return bookings.find(booking => {
      const checkIn = parseBookingDate(booking.checkIn);
      const checkOut = parseBookingDate(booking.checkOut);
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return currentDate >= checkIn && currentDate < checkOut;
    });
  };
  
  const getDayStatus = (date) => {
    const booking = getBookingForDate(date);
    if (booking) {
      if (booking.status === 'confirmed') return 'confirmed';
      if (booking.status === 'pending') return 'pending';
      if (booking.status === 'completed') return 'completed';
    }
    return 'available';
  };
  
  const getDayColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-300'; // Green for confirmed bookings
      case 'pending': return 'bg-yellow-200'; // Yellow for pending bookings
      case 'completed': return 'bg-blue-200'; // Blue for completed bookings
      default: return 'bg-yellow-100'; // Light yellow for available days
    }
  };
  
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const status = getDayStatus(date);
      const booking = getBookingForDate(date);
      const dayColor = getDayColor(status);
      
      days.push(
        <div
          key={day}
          className={`h-16 border border-gray-200 ${dayColor} flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => {
            if (booking) {
              navigate(`/guest/bookings/${booking.id.replace('Booking #', '')}`);
            }
          }}
        >
          <span className="text-sm font-medium text-gray-800">{day}</span>
          {booking && (
            <span className="text-xs text-gray-600 mt-1">
              {booking.id.replace('Booking #', '')}
            </span>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">{day}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <span className="text-sm text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;