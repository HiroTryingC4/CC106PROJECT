import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  CalendarIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const ActivityLogs = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    fetchActivityLogs();
  }, [token, startDate, endDate]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/activity-logs?${params.toString()}`, {
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }

      const data = await response.json();
      setActivityLogs(data.logs || []);
      setError('');
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconForAction = (action) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('booking')) return { icon: CalendarIcon, bg: 'bg-blue-100', color: 'text-blue-600' };
    if (lowerAction.includes('property') || lowerAction.includes('unit') || lowerAction.includes('suspended')) return { icon: HomeIcon, bg: 'bg-gray-100', color: 'text-gray-600' };
    if (lowerAction.includes('payment')) return { icon: CurrencyDollarIcon, bg: 'bg-green-100', color: 'text-green-600' };
    if (lowerAction.includes('review')) return { icon: StarIcon, bg: 'bg-yellow-100', color: 'text-yellow-600' };
    if (lowerAction.includes('user') || lowerAction.includes('verification') || lowerAction.includes('login') || lowerAction.includes('banned')) return { icon: UserIcon, bg: 'bg-purple-100', color: 'text-purple-600' };
    return { icon: ClipboardDocumentCheckIcon, bg: 'bg-gray-100', color: 'text-gray-600' };
  };

  const getTypeFromAction = (action) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('booking')) return 'booking';
    if (lowerAction.includes('property') || lowerAction.includes('unit')) return 'unit';
    if (lowerAction.includes('payment')) return 'payment';
    if (lowerAction.includes('review')) return 'review';
    if (lowerAction.includes('user') || lowerAction.includes('verification') || lowerAction.includes('login') || lowerAction.includes('banned')) return 'user';
    return 'other';
  };

  const getFilteredLogs = () => {
    if (activeTab === 'all') return activityLogs;
    return activityLogs.filter(log => getTypeFromAction(log.action) === activeTab);
  };

  const getTabCount = (type) => {
    if (type === 'all') return activityLogs.length;
    return activityLogs.filter(log => getTypeFromAction(log.action) === type).length;
  };

  const filteredLogs = getFilteredLogs();

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = paginateData(filteredLogs);

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Activity Logs</h1>
          <p className="mt-2 text-gray-600">System activity and audit trail</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity logs...</p>
          </div>
        ) : (
          <>
            {/* Date Range Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Start Date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="End Date"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'booking'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('unit')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'unit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'user'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'review'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Activity Log Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {paginatedLogs.map((log) => {
              const iconConfig = getIconForAction(log.action);
              const Icon = iconConfig.icon;
              return (
                <div key={log.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-start sm:space-x-4 sm:gap-0">
                  <div className={`w-12 h-12 ${iconConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${iconConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-green-600">
                        {log.action.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-xs text-gray-500 sm:text-sm">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 font-medium text-gray-900">{log.description}</p>
                    <p className="mt-1 text-sm text-gray-500">User ID: {log.userId}</p>
                    {log.ipAddress && (
                      <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-600">No {activeTab === 'all' ? '' : activeTab} activities to display.</p>
          </div>
        )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;