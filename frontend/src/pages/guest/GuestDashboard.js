import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_CONFIG from '../../config/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const API_BASE = API_CONFIG.BASE_URL;

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const GuestDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0,
    propertyTypeBreakdown: [],
    averageSpend: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };

        // Fetch all bookings for this guest
        const response = await axios.get(`${API_BASE}/bookings`, config);
        const bookingsData = response.data.bookings || [];

        // Build formatted bookings list
        const formattedBookings = bookingsData.map(booking => ({
          rawId: booking.id,
          id: `Booking #${booking.id}`,
          propertyTitle: booking.propertyTitle || `Property #${booking.propertyId}`,
          dates: `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
          totalAmount: parseFloat(booking.totalAmount) || 0,
          price: `₱${(parseFloat(booking.totalAmount) || 0).toLocaleString()}`,
          status: booking.status,
          statusColor: STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800',
          propertyId: booking.propertyId,
          guests: booking.guests,
          paymentStatus: booking.paymentStatus
        }));

        setBookings(formattedBookings);

        // Compute real stats from booking data
        const totalSpent = bookingsData
          .filter(b => b.status === 'completed' || b.status === 'confirmed')
          .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

        const upcoming = bookingsData.filter(b => b.status === 'confirmed').length;
        const completed = bookingsData.filter(b => b.status === 'completed').length;
        const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;

        // Fetch property type breakdown from properties booked
        let propertyTypeBreakdown = [];
        try {
          const propertyIds = [...new Set(bookingsData.map(b => b.propertyId).filter(Boolean))];
          if (propertyIds.length > 0) {
            // Query properties for type data
            const propResponses = await Promise.all(
              propertyIds.slice(0, 10).map(id =>
                axios.get(`${API_BASE}/properties/${id}`, config).catch(() => null)
              )
            );

            const typeCounts = {};
            propResponses.forEach(res => {
              if (res?.data) {
                const type = res.data.type || res.data.propertyType || 'Other';
                typeCounts[type] = (typeCounts[type] || 0) + 1;
              }
            });

            propertyTypeBreakdown = Object.entries(typeCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([type, count]) => ({ type, count }));
          }
        } catch {
          propertyTypeBreakdown = [];
        }

        setStats({
          totalBookings: bookingsData.length,
          upcoming,
          completed,
          cancelled,
          totalSpent,
          propertyTypeBreakdown,
          averageSpend: bookingsData.length > 0
            ? totalSpent / Math.max(1, completed + upcoming)
            : 0
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  return (
    <GuestLayout>
      <div className="space-y-8">
        {/* Trial Banner */}
        {user?.isTrial && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="text-2xl flex-shrink-0">🎯</div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-800">Trial Mode Active</h3>
                  <p className="text-yellow-700 text-xs sm:text-sm">You're exploring Smart Stay with sample data. Create an account to start booking real properties!</p>
                </div>
              </div>
              <Link 
                to="/register"
                className="w-full sm:w-auto text-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-medium text-sm"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-white to-green-50/70 p-4 sm:p-6 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Guest Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl">
            Welcome back, {user?.firstName || 'Guest'}! Here's your booking overview.
          </p>
        </div>

        {/* Stats Cards — all from real DB data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Total Bookings</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Upcoming</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.upcoming}</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Completed</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Total Spent</h3>
            <p className="text-xl sm:text-3xl font-bold text-purple-600">
              ₱{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => navigate('/guest/bookings')}
                className="self-start text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                View all →
              </button>
            </div>
          </div>
          
          {loading && (
            <div className="p-12 text-center text-gray-500">
              <LoadingSpinner text="Loading bookings..." />
            </div>
          )}
          
          {error && (
            <div className="p-6 bg-red-50 border border-red-200 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {!loading && !error && bookings.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>No bookings yet. Start exploring properties!</p>
              <Link to="/guest/units" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
                Browse Properties →
              </Link>
            </div>
          )}
          
          {!loading && bookings.length > 0 && (
            <div className="divide-y divide-gray-200">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.rawId} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between sm:block">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{booking.propertyTitle}</h3>
                            <p className="text-xs text-gray-400">{booking.id}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full sm:hidden ${booking.statusColor}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{booking.dates}</p>
                        <p className="text-sm font-medium text-blue-600 mt-1">{booking.price}</p>
                      </div>
                      <span className={`hidden sm:inline-block px-2 py-1 text-xs font-medium rounded-full ${booking.statusColor}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/guest/bookings/${booking.rawId}`)}
                    className="w-full sm:w-auto text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90"
                    style={{backgroundColor: '#4E7B22'}}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Stats — real data from DB */}
        {!loading && stats.totalBookings > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <span className="text-blue-500 mr-2">📊</span>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Booking Stats</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Booking Breakdown</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Confirmed</span>
                    <span className="text-green-600 font-medium">{stats.upcoming}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="text-blue-600 font-medium">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cancelled</span>
                    <span className="text-red-500 font-medium">{stats.cancelled}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Property Types Booked</h3>
                {stats.propertyTypeBreakdown.length > 0 ? (
                  <div className="space-y-1">
                    {stats.propertyTypeBreakdown.map(({ type, count }) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span className="text-gray-500">{count} booking{count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No data yet</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Spending Summary</h3>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  ₱{stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg per stay: ₱{stats.averageSpend.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
};

export default GuestDashboard;