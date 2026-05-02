import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { ChartBarIcon, CurrencyDollarIcon, HomeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';

const HostAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_CONFIG.BASE_URL}/analytics/host`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to load analytics');
        }

        const data = await response.json();
        setAnalytics(data);
        setError('');
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <HostLayout>
        <div className="p-6 text-gray-600">Loading analytics...</div>
      </HostLayout>
    );
  }

  if (error) {
    return (
      <HostLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your property performance and earnings</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Properties</h3>
              <HomeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics?.overview?.totalProperties || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <CalendarIcon className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics?.overview?.totalBookings || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₱{(analytics?.overview?.totalRevenue || 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Occupancy Rate</h3>
              <ChartBarIcon className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {analytics?.overview?.occupancyRate || 0}%
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Trends</h2>
          <div className="space-y-4">
            {analytics?.revenueData?.monthly?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.min(100, (item.revenue / Math.max(...(analytics?.revenueData?.monthly?.map(m => m.revenue) || [1]))) * 100)}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        ₱{item.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Trends</h2>
          <div className="space-y-4">
            {analytics?.bookingTrends?.monthly?.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-green-600 h-full flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.min(100, (item.bookings / Math.max(...(analytics?.bookingTrends?.monthly?.map(m => m.bookings) || [1]))) * 100)}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {item.bookings} booking{item.bookings !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Performance</h2>
          <div className="space-y-4">
            {analytics?.propertyPerformance?.map((property, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{property.name}</h3>
                    <p className="text-sm text-gray-500">Property #{property.propertyId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₱{property.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-600 h-full"
                    style={{ width: `${property.performance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostAnalytics;
