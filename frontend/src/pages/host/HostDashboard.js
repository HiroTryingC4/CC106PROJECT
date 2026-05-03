import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const HostDashboard = () => {
  const { user, token } = useAuth();
  const API_BASE = API_CONFIG.BASE_URL;
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationFormData, setVerificationFormData] = useState(null);
  const [hostProfile, setHostProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch verification status and dashboard data when component mounts
    const fetchData = async () => {
      try {
        const authToken = token;
        if (!authToken) return;
        const authHeaders = { 'Authorization': `Bearer ${authToken}` };

        // Fetch host profile
        const profileResponse = await fetch(`${API_BASE}/host/profile`, { headers: authHeaders });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setHostProfile(profileData.data);
        }

        // Fetch verification status
        const verificationResponse = await fetch(`${API_BASE}/host/verification-status`, { headers: authHeaders });

        if (verificationResponse.ok) {
          const verificationData = await verificationResponse.json();
          setVerificationStatus(verificationData);

          // Always try to fetch verification form data if status is pending or verified
          if (verificationData.status === 'pending' || verificationData.status === 'verified') {
            try {
              const formDataResponse = await fetch(`${API_BASE}/host/verification-data`, { headers: authHeaders });

              if (formDataResponse.ok) {
                const formData = await formDataResponse.json();
                setVerificationFormData(formData.data);
              }
            } catch (err) {
              console.error('Error fetching verification data:', err);
            }
          }

          // If verified, fetch dashboard data
          if (verificationData.status === 'verified') {
            // Fetch properties
            const propertiesResponse = await fetch(`${API_BASE}/properties?hostId=${user.id}`, { headers: authHeaders });
            const bookingsResponse = await fetch(`${API_BASE}/bookings`, { headers: authHeaders });
            const analyticsResponse = await fetch(`${API_BASE}/analytics/host`, { headers: authHeaders });

            const [propertiesData, bookingsData, analyticsData] = await Promise.all([
              propertiesResponse.ok ? propertiesResponse.json() : { properties: [], total: 0 },
              bookingsResponse.ok ? bookingsResponse.json() : { bookings: [], total: 0 },
              analyticsResponse.ok ? analyticsResponse.json() : null
            ]);

            setDashboardData({
              properties: propertiesData.properties || [],
              bookings: bookingsData.bookings || [],
              analytics: analyticsData
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default status if API fails
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'host') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getHostProfileCard = () => {
    if (!hostProfile) return null;

    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-lg sm:text-2xl font-bold">
                {hostProfile.firstName?.charAt(0)}{hostProfile.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{hostProfile.fullName}</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">{hostProfile.email}</p>
              {hostProfile.company && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">
                  <span className="font-semibold">Business:</span> {hostProfile.company}
                </p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-xs sm:text-sm font-medium text-gray-500">Account Status</p>
            <p className="text-base sm:text-lg font-semibold text-green-700 mt-1">Active Host</p>
          </div>
        </div>
      </div>
    );
  };

  const getVerificationBanner = () => {
    if (!verificationStatus || user?.role !== 'host') return null;

    const { status, message } = verificationStatus;

    const bannerConfig = {
      not_submitted: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
        title: 'Verification Required',
        message: 'Complete your verification to unlock all host features.',
        actionText: 'Start Verification',
        actionLink: '/host/verification'
      },
      pending: {
        icon: ClockIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        title: 'Verification Pending',
        message: message || 'Your verification is currently under review. We will notify you once it\'s complete.',
        actionText: 'Check Status',
        actionLink: '/host/verification'
      },
      verified: {
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        title: 'Verification Complete',
        message: 'Your account is verified! You have access to all host features.',
        actionText: null,
        actionLink: null
      },
      rejected: {
        icon: XCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        title: 'Verification Rejected',
        message: message || 'Your verification was rejected. Please review and resubmit your documents.',
        actionText: 'Resubmit Documents',
        actionLink: '/host/verification'
      }
    };

    const config = bannerConfig[status];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-2xl p-4 mb-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
          <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 w-full">
            <h3 className={`font-semibold ${config.textColor} mb-1 text-sm sm:text-base`}>{config.title}</h3>
            <p className={`text-xs sm:text-sm ${config.textColor} opacity-90 mb-3`}>{config.message}</p>
            {config.actionText && config.actionLink && (
              <Link
                to={config.actionLink}
                className={`inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-start ${
                  status === 'not_submitted' 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : status === 'pending'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {config.actionText}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Check if user is verified
  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

  const getVerificationFormDisplay = () => {
    // Show card if verification data exists and status is pending or verified
    if (!verificationStatus || (verificationStatus.status === 'not_submitted')) {
      return null;
    }

    // If status is pending or verified but no form data yet, show loading state
    if (!verificationFormData) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Verification Application</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              verificationStatus.status === 'verified' 
                ? 'bg-green-100 text-green-800'
                : verificationStatus.status === 'pending'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {verificationStatus.status === 'verified' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
              {verificationStatus.status === 'pending' && <ClockIcon className="w-4 h-4 mr-1" />}
              {verificationStatus.status === 'rejected' && <XCircleIcon className="w-4 h-4 mr-1" />}
              {verificationStatus.status.charAt(0).toUpperCase() + verificationStatus.status.slice(1)}
            </span>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading verification details...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Verification Application</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
            verificationStatus.status === 'verified' 
              ? 'bg-green-100 text-green-800'
              : verificationStatus.status === 'pending'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {verificationStatus.status === 'verified' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
            {verificationStatus.status === 'pending' && <ClockIcon className="w-4 h-4 mr-1" />}
            {verificationStatus.status === 'rejected' && <XCircleIcon className="w-4 h-4 mr-1" />}
            {verificationStatus.status.charAt(0).toUpperCase() + verificationStatus.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Business Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Business Name</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{verificationFormData.businessName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Business Type</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{verificationFormData.businessType}</p>
            </div>
          </div>

          {/* Address & ID Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Business Address</label>
              <p className="text-lg font-semibold text-gray-900 mt-1 line-clamp-2">{verificationFormData.businessAddress}</p>
            </div>
          </div>

          {/* ID & Tax Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">ID Type</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{verificationFormData.idType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">ID Number</label>
              <p className="text-lg font-semibold text-gray-900 mt-1 font-mono">{verificationFormData.idNumber}</p>
            </div>
          </div>

          {/* Tax ID */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Tax ID</label>
              <p className="text-lg font-semibold text-gray-900 mt-1 font-mono">{verificationFormData.taxId === 'none' ? 'Not provided' : verificationFormData.taxId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Submitted On</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{verificationFormData.submittedAt ? new Date(verificationFormData.submittedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {verificationStatus.status !== 'verified' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/host/verification"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Edit Application
            </Link>
          </div>
        )}
      </div>
    );
  };

  // Calculate stats from dashboard data
  const getStatsCards = () => {
    if (!isVerified || !dashboardData) {
      return [
        {
          title: 'Total Units',
          value: '0',
          subtitle: '',
          icon: HomeIcon,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600'
        },
        {
          title: 'Active Bookings',
          value: '0',
          subtitle: '',
          icon: BuildingOfficeIcon,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        },
        {
          title: 'Pending Deposits',
          value: '0',
          subtitle: '',
          icon: ClockIcon,
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        },
        {
          title: 'Pending Bookings',
          value: '0',
          subtitle: '',
          icon: ClockIcon,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        },
        {
          title: 'Revenue (MTD)',
          value: '0',
          subtitle: '',
          icon: CurrencyDollarIcon,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        }
      ];
    }

    const { properties, bookings, analytics } = dashboardData;
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const monthlyRevenue = analytics?.overview?.totalRevenue || 0;

    return [
      {
        title: 'Total Units',
        value: properties.length.toString(),
        subtitle: `${properties.filter(p => p.availability).length} available`,
        icon: HomeIcon,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
      },
      {
        title: 'Active Bookings',
        value: activeBookings.toString(),
        subtitle: 'confirmed stays',
        icon: BuildingOfficeIcon,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
      },
      {
        title: 'Pending Deposits',
        value: '0',
        subtitle: 'awaiting payment',
        icon: ClockIcon,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600'
      },
      {
        title: 'Pending Bookings',
        value: pendingBookings.toString(),
        subtitle: 'awaiting approval',
        icon: ClockIcon,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      },
      {
        title: 'Revenue (MTD)',
        value: `₱${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        subtitle: 'this month',
        icon: CurrencyDollarIcon,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
      }
    ];
  };

  // Get insights and activity from analytics data
  const getInsightsAndActivity = () => {
    if (!isVerified || !dashboardData?.analytics) {
      return {
        insights: [],
        activity: []
      };
    }

    const { analytics } = dashboardData;
    
    return {
      insights: analytics.recommendations || [],
      activity: analytics.recentActivity || []
    };
  };

  const statsCards = getStatsCards();
  const { insights, activity } = getInsightsAndActivity();

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <HostLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Overview</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <span>📅</span>
              <span>Oct 24, 2023</span>
            </div>
          </div>
        </div>

        {/* Host Profile Card */}
        {!loading && getHostProfileCard()}

        {/* Verification Status Banner */}
        {!loading && getVerificationBanner()}

        {/* Verification Application Details */}
        {!loading && getVerificationFormDisplay()}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                  <div className="flex-1 w-full">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">{stat.title}</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.subtitle}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mt-2 sm:mt-0 sm:ml-4 self-end sm:self-start shadow-sm`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights & Recommendations */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <ChartBarIcon className="w-5 h-5 text-green-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">AI Insights & Recommendations</h2>
              </div>
              
              {isVerified && insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h3 className="font-semibold text-blue-800 mb-1 text-sm sm:text-base">{insight.title}</h3>
                      <p className="text-xs sm:text-sm text-blue-800 opacity-90">{insight.description}</p>
                      {insight.estimatedRevenue && (
                        <p className="text-xs text-blue-600 mt-2">Potential revenue: ₱{insight.estimatedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <ChartBarIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No AI insights available</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    {isVerified ? 'Insights will appear as you get more bookings.' : 'Verify your account to unlock personalized recommendations.'}
                  </p>
                  {!isVerified && (
                    <Link
                      to="/host/verification"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                    >
                      Complete Verification
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              
              {isVerified && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((activityItem, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(activityItem.status)} mt-2 flex-shrink-0 shadow-sm`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{activityItem.property}</p>
                        <p className="text-sm text-gray-600">{activityItem.guest} • {activityItem.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activityItem.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <InformationCircleIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Activity unavailable</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {isVerified ? 'Recent activity will appear here.' : 'Recent activity will appear once your account is verified.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostDashboard;