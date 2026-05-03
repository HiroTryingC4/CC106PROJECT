import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import API_CONFIG from '../../config/api';

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const BookingHistory = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('Bookings');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('List');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiBaseUrl = API_CONFIG.BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        const bookingsResponse = await fetch(`${apiBaseUrl}/bookings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });

        if (!bookingsResponse.ok) {
          throw new Error('Failed to load bookings');
        }

        const bookingsData = await bookingsResponse.json();
        const mappedBookings = (bookingsData.bookings || []).map((booking) => {
          const checkInDate = new Date(booking.checkIn);
          const checkOutDate = new Date(booking.checkOut);

          return {
            id: `Booking #${booking.id}`,
            rawId: booking.id,
            checkIn: checkInDate.toLocaleDateString('en-PH'),
            checkOut: checkOutDate.toLocaleDateString('en-PH'),
            guests: booking.guests,
            totalPrice: `₱${Number(booking.totalAmount || 0).toLocaleString('en-PH')}`,
            status: booking.status,
            statusBadge: booking.status,
            checkInDate,
            checkOutDate
          };
        });

        setBookings(mappedBookings);

        const paymentsResponse = await fetch(`${apiBaseUrl}/payments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.payments || []);
        }

        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  const getFilteredBookings = () => {
    if (activeTab === 'All') return bookings;
    if (activeTab === 'Upcoming') return bookings.filter((booking) => booking.status === 'confirmed');
    if (activeTab === 'Pending') return bookings.filter((booking) => booking.status === 'pending');
    if (activeTab === 'Past') return bookings.filter((booking) => booking.status === 'completed');
    return bookings;
  };

  const tabs = ['All', 'Upcoming', 'Pending', 'Past'];

  const formatPaymentMethod = (method) => {
    switch (String(method || '').toLowerCase()) {
      case 'grab_pay':
      case 'paymaya':
        return 'Maya';
      case 'gcash':
        return 'GCash';
      case 'card':
        return 'Card';
      default:
        return String(method || 'N/A').toUpperCase();
    }
  };

  return (
    <GuestLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-white to-green-50/70 p-4 sm:p-6 shadow-sm space-y-4 lg:space-y-0 lg:flex lg:justify-between lg:items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#4E7B22' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">View and manage your bookings and payments</p>
            </div>
          </div>

          {mainTab === 'Bookings' && (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={() => setViewMode('List')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  viewMode === 'List' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('Calendar')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  viewMode === 'Calendar' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                <span>Calendar</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setMainTab('Bookings')}
            className={`px-4 sm:px-6 py-3 font-medium transition-colors border-b-2 rounded-t-lg ${
              mainTab === 'Bookings'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setMainTab('Payments')}
            className={`px-4 sm:px-6 py-3 font-medium transition-colors border-b-2 rounded-t-lg ${
              mainTab === 'Payments'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Payment History
          </button>
        </div>

        {mainTab === 'Bookings' && (
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={activeTab === tab ? { backgroundColor: '#4E7B22' } : {}}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-600">Loading...</div>}

        {error && !loading && <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700">{error}</div>}

        {!loading && !error && mainTab === 'Bookings' && (
          viewMode === 'List' ? (
            <div className="space-y-4">
              {getFilteredBookings().map((booking) => (
                <div key={booking.rawId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{booking.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                          {booking.statusBadge}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Check-in</h4>
                          <p className="text-gray-600">{booking.checkIn}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Check-out</h4>
                          <p className="text-gray-600">{booking.checkOut}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Guest</h4>
                          <p className="text-gray-600">{booking.guests}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Total Price</h4>
                          <p className="text-blue-600 font-semibold">{booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:pl-4">
                      <button
                        onClick={() => navigate(`/guest/bookings/${booking.rawId}`)}
                        className="w-full lg:w-auto text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
                        style={{ backgroundColor: '#4E7B22' }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CalendarView bookings={getFilteredBookings()} navigate={navigate} />
          )
        )}

        {!loading && !error && mainTab === 'Payments' && (
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Payment #{payment.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Booking ID</h4>
                          <p className="text-gray-600">#{payment.bookingId}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Amount</h4>
                          <p className="text-blue-600 font-semibold">₱{Number(payment.amount || 0).toLocaleString('en-PH')}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Method</h4>
                          <p className="text-gray-600">{formatPaymentMethod(payment.paymentMethod)}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Date</h4>
                          <p className="text-gray-600">{new Date(payment.createdAt).toLocaleDateString('en-PH')}</p>
                        </div>
                      </div>

                      {payment.referenceNumber && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-1">Reference Number</h4>
                          <p className="text-gray-600 font-mono text-sm">{payment.referenceNumber}</p>
                        </div>
                      )}
                    </div>

                    <div className="lg:pl-4">
                      <button
                        onClick={() => navigate(`/guest/bookings/${payment.bookingId}`)}
                        className="w-full lg:w-auto text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
                        style={{ backgroundColor: '#4E7B22' }}
                      >
                        View Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                <p className="text-gray-600">You haven't made any payments yet.</p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && mainTab === 'Bookings' && getFilteredBookings().length === 0 && (
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
      </div>
    </GuestLayout>
  );
};

const CalendarView = ({ bookings, navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const parseBookingDate = (dateStr) => {
    const [month, day, year] = dateStr.split('/');
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  };

  const getBookingForDate = (date) => {
    return bookings.find((booking) => {
      const checkIn = parseBookingDate(booking.checkIn);
      const checkOut = parseBookingDate(booking.checkOut);
      const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return current >= checkIn && current < checkOut;
    });
  };

  const getDayStatus = (date) => {
    const booking = getBookingForDate(date);
    if (!booking) return 'available';
    if (booking.status === 'confirmed') return 'confirmed';
    if (booking.status === 'pending') return 'pending';
    if (booking.status === 'completed') return 'completed';
    if (booking.status === 'cancelled') return 'cancelled';
    return 'available';
  };

  const getDayColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-300';
      case 'pending': return 'bg-yellow-200';
      case 'completed': return 'bg-blue-200';
      case 'cancelled': return 'bg-red-200';
      default: return 'bg-yellow-100';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate((previousDate) => {
      const nextDate = new Date(previousDate);
      nextDate.setMonth(previousDate.getMonth() + direction);
      return nextDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let index = 0; index < firstDay; index++) {
      days.push(<div key={`empty-${index}`} className="h-16" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const status = getDayStatus(date);
      const booking = getBookingForDate(date);

      days.push(
        <div
          key={day}
          className={`h-16 border border-gray-200 ${getDayColor(status)} flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => {
            if (booking) {
              navigate(`/guest/bookings/${booking.rawId}`);
            }
          }}
        >
          <span className="text-sm font-medium text-gray-800">{day}</span>
          {booking && <span className="text-xs text-gray-600 mt-1">{booking.id}</span>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-6">
        <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center flex-1">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px] sm:min-w-0">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-10 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium text-gray-600">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 pt-4 border-t">
        <LegendItem color="bg-green-300" label="Confirmed" />
        <LegendItem color="bg-yellow-200" label="Pending" />
        <LegendItem color="bg-blue-200" label="Completed" />
        <LegendItem color="bg-red-200" label="Cancelled" />
        <LegendItem color="bg-yellow-100" label="Available" />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-4 h-4 ${color} rounded`} />
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);

export default BookingHistory;