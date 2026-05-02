import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  HomeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostReports = () => {
  const { user, token } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [activeTab, setActiveTab] = useState('revenue');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsOverview, setAnalyticsOverview] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    totalGuests: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [unitPerformance, setUnitPerformance] = useState([]);

  const getAuthHeaders = () => ({
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        if (!user) {
          setVerificationStatus(null);
          return;
        }

        const response = await fetch(`${apiBaseUrl}/host/verification-status`, {
          credentials: 'include',
          headers: getAuthHeaders()
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
  }, [apiBaseUrl, token, user]);

  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !isVerified) {
        setAnalyticsOverview({
          totalRevenue: 0,
          totalBookings: 0,
          occupancyRate: 0,
          totalGuests: 0
        });
        setRevenueData([]);
        setBookingsData([]);
        setUnitPerformance([]);
        return;
      }

      try {
        setAnalyticsLoading(true);
        const response = await fetch(`${apiBaseUrl}/analytics/host`, {
          credentials: 'include',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to load analytics');
        }

        const payload = await response.json();
        const overview = payload?.overview || {};
        setAnalyticsOverview({
          totalRevenue: Number(overview.totalRevenue || 0),
          totalBookings: Number(overview.totalBookings || 0),
          occupancyRate: Number(overview.occupancyRate || 0),
          totalGuests: Number(overview.totalGuests || 0)
        });

        const normalizedRevenue = (payload?.revenueData?.monthly || []).map((item) => ({
          month: item.month,
          value: Number(item.revenue || 0)
        }));
        const normalizedBookings = (payload?.bookingTrends?.monthly || []).map((item) => ({
          month: item.month,
          value: Number(item.bookings || 0)
        }));
        setRevenueData(normalizedRevenue);
        setBookingsData(normalizedBookings);

        const normalizedPerformance = (payload?.propertyPerformance || []).map((item) => ({
          name: item.name,
          performance: Number(item.performance || 0)
        }));
        setUnitPerformance(normalizedPerformance);
      } catch (error) {
        console.error('Error fetching host analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [apiBaseUrl, isVerified, token, user]);

  const maxRevenue = Math.max(...revenueData.map((d) => d.value), 1);
  const maxBookings = Math.max(...bookingsData.map((d) => d.value), 1);

  const analyticsData = {
    totalRevenue: {
      value: `₱${analyticsOverview.totalRevenue.toLocaleString('en-PH')}`,
      change: ''
    },
    totalBookings: {
      value: analyticsOverview.totalBookings.toLocaleString('en-PH'),
      change: ''
    },
    avgOccupancy: {
      value: `${analyticsOverview.occupancyRate}%`,
      change: ''
    },
    totalGuests: {
      value: analyticsOverview.totalGuests.toLocaleString('en-PH'),
      change: ''
    }
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track your business performance and insights</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.totalRevenue.value}</p>
            <p className="text-sm text-green-600 flex items-center">
              {analyticsData.totalRevenue.change ? (
                <>
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  {analyticsData.totalRevenue.change}
                </>
              ) : analyticsLoading ? (
                'Loading...'
              ) : null}
            </p>
          </div>

          {/* Total Bookings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.totalBookings.value}</p>
            <p className="text-sm text-green-600 flex items-center">
              {analyticsData.totalBookings.change ? (
                <>
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  {analyticsData.totalBookings.change}
                </>
              ) : analyticsLoading ? (
                'Loading...'
              ) : null}
            </p>
          </div>

          {/* Avg Occupancy */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Avg Occupancy</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.avgOccupancy.value}</p>
            <p className="text-sm text-green-600 flex items-center">
              {analyticsData.avgOccupancy.change ? (
                <>
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  {analyticsData.avgOccupancy.change}
                </>
              ) : analyticsLoading ? (
                'Loading...'
              ) : null}
            </p>
          </div>

          {/* Total Guests */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Guests</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{analyticsData.totalGuests.value}</p>
            <p className="text-sm text-green-600 flex items-center">
              {analyticsData.totalGuests.change ? (
                <>
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  {analyticsData.totalGuests.change}
                </>
              ) : analyticsLoading ? (
                'Loading...'
              ) : null}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Unit Performance
            </button>
          </nav>
        </div>

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends (Last 7 Months)</h3>
            
            {isVerified && revenueData.length > 0 ? (
              /* Area Chart */
              <div className="relative h-80">
                <svg className="w-full h-full" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="300" fill="url(#grid)" />
                  
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Create path for area */}
                  <path
                    d={`M 50 ${300 - (revenueData[0].value / maxRevenue) * 250} 
                        L 150 ${300 - (revenueData[1].value / maxRevenue) * 250}
                        L 250 ${300 - (revenueData[2].value / maxRevenue) * 250}
                        L 350 ${300 - (revenueData[3].value / maxRevenue) * 250}
                        L 450 ${300 - (revenueData[4].value / maxRevenue) * 250}
                        L 550 ${300 - (revenueData[5].value / maxRevenue) * 250}
                        L 650 ${300 - (revenueData[6].value / maxRevenue) * 250}
                        L 650 300 L 50 300 Z`}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={`M 50 ${300 - (revenueData[0].value / maxRevenue) * 250} 
                        L 150 ${300 - (revenueData[1].value / maxRevenue) * 250}
                        L 250 ${300 - (revenueData[2].value / maxRevenue) * 250}
                        L 350 ${300 - (revenueData[3].value / maxRevenue) * 250}
                        L 450 ${300 - (revenueData[4].value / maxRevenue) * 250}
                        L 550 ${300 - (revenueData[5].value / maxRevenue) * 250}
                        L 650 ${300 - (revenueData[6].value / maxRevenue) * 250}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  
                  {/* Data points */}
                  {revenueData.map((data, index) => (
                    <circle
                      key={index}
                      cx={50 + index * 100}
                      cy={300 - (data.value / maxRevenue) * 250}
                      r="4"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  
                  {/* X-axis labels */}
                  {revenueData.map((data, index) => (
                    <text
                      key={index}
                      x={50 + index * 100}
                      y={320}
                      textAnchor="middle"
                      className="text-sm fill-gray-500"
                    >
                      {data.month}
                    </text>
                  ))}
                  
                  {/* Y-axis labels */}
                  <text x="20" y="60" className="text-sm fill-gray-500">30000</text>
                  <text x="20" y="110" className="text-sm fill-gray-500">25000</text>
                  <text x="20" y="160" className="text-sm fill-gray-500">20000</text>
                  <text x="20" y="210" className="text-sm fill-gray-500">15000</text>
                  <text x="20" y="260" className="text-sm fill-gray-500">10000</text>
                  <text x="20" y="310" className="text-sm fill-gray-500">0</text>
                </svg>
              </div>
            ) : (
              <div className="text-center py-16">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No revenue data available</h3>
                {!isVerified ? (
                  <>
                    <p className="text-gray-600 mb-6">Complete verification to view your revenue analytics and trends.</p>
                    <a
                      href="/host/verification"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                    >
                      <span>Complete Verification</span>
                    </a>
                  </>
                ) : (
                  <p className="text-gray-600 mb-6">No backend revenue records yet for this period.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking (Last 7 Months)</h3>
            
            {isVerified && bookingsData.length > 0 ? (
              /* Bar Chart */
              <div className="relative h-80">
                <svg className="w-full h-full" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="bookingGrid" width="100" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="300" fill="url(#bookingGrid)" />
                  
                  {/* Bars */}
                  {bookingsData.map((data, index) => (
                    <rect
                      key={index}
                      x={50 + index * 100 - 25}
                      y={300 - (data.value / maxBookings) * 250}
                      width="50"
                      height={(data.value / maxBookings) * 250}
                      fill="#4E7B22"
                      rx="4"
                    />
                  ))}
                  
                  {/* X-axis labels */}
                  {bookingsData.map((data, index) => (
                    <text
                      key={index}
                      x={50 + index * 100}
                      y={320}
                      textAnchor="middle"
                      className="text-sm fill-gray-500"
                    >
                      {data.month}
                    </text>
                  ))}
                  
                  {/* Y-axis labels */}
                  <text x="20" y="60" className="text-sm fill-gray-500">60</text>
                  <text x="20" y="110" className="text-sm fill-gray-500">50</text>
                  <text x="20" y="160" className="text-sm fill-gray-500">40</text>
                  <text x="20" y="210" className="text-sm fill-gray-500">30</text>
                  <text x="20" y="260" className="text-sm fill-gray-500">20</text>
                  <text x="20" y="310" className="text-sm fill-gray-500">0</text>
                </svg>
              </div>
            ) : (
              <div className="text-center py-16">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No booking data available</h3>
                {!isVerified ? (
                  <>
                    <p className="text-gray-600 mb-6">Complete verification to view your booking analytics and trends.</p>
                    <a
                      href="/host/verification"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                    >
                      <span>Complete Verification</span>
                    </a>
                  </>
                ) : (
                  <p className="text-gray-600 mb-6">No backend booking records yet for this period.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Unit Performance Tab */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends (Last 7 Months)</h3>
            
            {isVerified && unitPerformance.length > 0 ? (
              <>
                {/* Horizontal Bar Chart */}
                <div className="space-y-4">
                  {unitPerformance.map((unit, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-700 text-right">{unit.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-[#4E7B22] h-6 rounded-full transition-all duration-500"
                          style={{ width: `${unit.performance * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-sm text-gray-500 text-right">
                        {unit.performance.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Scale indicators */}
                <div className="flex justify-between mt-4 text-xs text-gray-400">
                  <span>0</span>
                  <span>0.2</span>
                  <span>0.4</span>
                  <span>0.6</span>
                  <span>0.8</span>
                  <span>1</span>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data available</h3>
                {!isVerified ? (
                  <>
                    <p className="text-gray-600 mb-6">Complete verification to view your unit performance analytics.</p>
                    <a
                      href="/host/verification"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                    >
                      <span>Complete Verification</span>
                    </a>
                  </>
                ) : (
                  <p className="text-gray-600 mb-6">No property performance data available yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostReports;