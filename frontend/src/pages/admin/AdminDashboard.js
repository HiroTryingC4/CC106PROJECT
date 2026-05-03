import { useEffect, useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/dashboard`, {
          credentials: 'include',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data.stats);
        setRevenueData(data.revenueData || []);
        setBookingsData(data.bookingsData || []);
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const statsConfig = [
    { 
      name: 'Total Users', 
      value: stats?.totalUsers || 0,
      change: stats?.changes?.users || '0%',
      icon: UsersIcon,
      iconBg: 'bg-blue-500',
      iconColor: 'text-white'
    },
    { 
      name: 'Total Hosts', 
      value: stats?.totalHosts || 0,
      change: stats?.changes?.hosts || '0%',
      icon: UserGroupIcon,
      iconBg: 'bg-gray-600',
      iconColor: 'text-white'
    },
    { 
      name: 'Total Units', 
      value: stats?.totalProperties || 0,
      change: stats?.changes?.properties || '0%',
      icon: BuildingOfficeIcon,
      iconBg: 'bg-purple-600',
      iconColor: 'text-white'
    },
    { 
      name: 'Active Bookings', 
      value: stats?.activeBookings || 0,
      change: stats?.changes?.bookings || '0%',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-orange-500',
      iconColor: 'text-white'
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and analytics for Smart Stay AI</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Stats Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value.toLocaleString()}</p>
                      <p className={`text-sm ${
                        stat.change.startsWith('+') ? 'text-green-600' : 
                        stat.change.startsWith('-') ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>{stat.change} vs last week</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Charts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Trend (Last 30 Days)</h2>
              
              {/* Chart Container */}
              <div className="h-64 sm:h-72 lg:h-80 relative overflow-hidden">
                {revenueData.length > 0 ? (
                  <>
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 hidden h-full flex-col justify-between py-4 text-xs text-gray-500 sm:flex">
                      {[...Array(5)].map((_, i) => {
                        const maxValue = Math.max(...revenueData.map(d => d.value), 1);
                        const value = Math.round((maxValue * (4 - i)) / 4);
                        return <span key={i}>₱{value.toLocaleString()}</span>;
                      })}
                    </div>
                    
                    {/* Chart area */}
                    <div className="ml-0 h-full relative sm:ml-16">
                      {/* Grid lines */}
                      <div className="absolute inset-0 hidden flex-col justify-between sm:flex">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="border-t border-gray-100"></div>
                        ))}
                      </div>
                      
                      {/* Line chart */}
                      <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                        {revenueData.length > 1 && (
                          <>
                            <polyline
                              fill="none"
                              stroke="#3B82F6"
                              strokeWidth="3"
                              points={revenueData.map((item, i) => {
                                const maxValue = Math.max(...revenueData.map(d => d.value), 1);
                                const x = (i / (revenueData.length - 1)) * 380 + 10;
                                const y = 280 - ((item.value / maxValue) * 260);
                                return `${x},${y}`;
                              }).join(' ')}
                            />
                            {revenueData.map((item, i) => {
                              const maxValue = Math.max(...revenueData.map(d => d.value), 1);
                              const x = (i / (revenueData.length - 1)) * 380 + 10;
                              const y = 280 - ((item.value / maxValue) * 260);
                              return <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />;
                            })}
                          </>
                        )}
                      </svg>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-500 sm:left-16 sm:text-xs">
                      {revenueData.map((item, i) => (
                        <span key={i}>{item.date}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>No revenue data available for the last 30 days</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-blue-600 font-medium">Revenue (₱)</span>
              </div>
            </div>

            {/* Bookings Overview Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookings Overview (Last 30 Days)</h2>
              
              {/* Chart Container */}
              <div className="h-64 sm:h-72 lg:h-80 relative overflow-hidden">
                {bookingsData.length > 0 ? (
                  <>
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 hidden h-full flex-col justify-between py-4 text-xs text-gray-500 sm:flex">
                      {[...Array(5)].map((_, i) => {
                        const maxValue = Math.max(...bookingsData.map(d => d.value), 1);
                        const value = Math.round((maxValue * (4 - i)) / 4);
                        return <span key={i}>{value}</span>;
                      })}
                    </div>
                    
                    {/* Chart area */}
                    <div className="ml-0 h-full relative flex items-end justify-between px-2 pb-6 sm:ml-12 sm:px-4 sm:pb-8">
                      {bookingsData.map((item, index) => {
                        const maxValue = Math.max(...bookingsData.map(d => d.value), 1);
                        const heightPercent = (item.value / maxValue) * 100;
                        // Ensure minimum 20% height so bars are always visible
                        const height = Math.max(heightPercent, 20);
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 mx-0.5 sm:mx-1">
                            <div 
                              className="bg-purple-600 rounded-t-md w-full min-h-[40px]"
                              style={{ height: `${height}%` }}
                              title={`${item.value} bookings`}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-gray-500 sm:left-12 sm:px-4 sm:text-xs">
                      {bookingsData.map((item, i) => (
                        <span key={i} className="flex-1 text-center">{item.date}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>No bookings data available for the last 30 days</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                <span className="text-sm text-purple-600 font-medium">Bookings</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;