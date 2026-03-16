import React from 'react';
import { Link } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const HostDashboard = () => {
  const { user } = useAuth();

  const statsCards = [
    {
      title: 'Total Units',
      value: '12',
      subtitle: '+2 this month',
      icon: HomeIcon,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Active Bookings',
      value: '20',
      subtitle: '8 Checking in today',
      icon: CalendarDaysIcon,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending Deposits',
      value: '5',
      subtitle: 'Requires action',
      icon: ClockIcon,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Pending Bookings',
      value: '20',
      subtitle: 'Requires action',
      icon: ClockIcon,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Revenue (MTD)',
      value: '20',
      subtitle: '+18% vs last month',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  const insights = [
    {
      title: 'Smart Pricing Opportunity',
      description: '3 units can increase rates by 15% upcoming weekend',
      color: 'bg-blue-100 border-l-4 border-l-blue-500',
      textColor: 'text-blue-800'
    },
    {
      title: 'Guest Response Needed',
      description: 'AI assistant needs approval for special request at Sunset Villa',
      color: 'bg-orange-100 border-l-4 border-l-orange-500',
      textColor: 'text-orange-800'
    },
    {
      title: 'High Engagement',
      description: 'AI handled 47 guest inquiries today with 95% satisfaction',
      color: 'bg-green-100 border-l-4 border-l-green-500',
      textColor: 'text-green-800'
    }
  ];

  const recentActivity = [
    {
      property: 'Sunset Villa',
      guest: 'Sarah Johnson',
      action: 'Check-in confirmed',
      time: '2 hours ago',
      status: 'success'
    },
    {
      property: 'Ocean View Apartment',
      guest: 'Michael Chen',
      action: 'Payment received',
      time: '4 hours ago',
      status: 'success'
    },
    {
      property: 'Mountain Cabin',
      guest: 'Emma Williams',
      action: 'AI requested human review',
      time: '5 hours ago',
      status: 'warning'
    },
    {
      property: 'City Loft',
      guest: 'David Brown',
      action: 'Booking confirmed',
      time: '6 hours ago',
      status: 'success'
    }
  ];

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>📅</span>
              <span>Oct 24, 2023</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.subtitle}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center ml-4`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
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
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <ChartBarIcon className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h2>
              </div>
              
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg ${insight.color}`}>
                    <h3 className={`font-semibold ${insight.textColor} mb-1`}>{insight.title}</h3>
                    <p className={`text-sm ${insight.textColor} opacity-90`}>{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)} mt-2 flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{activity.property}</p>
                      <p className="text-sm text-gray-600">{activity.guest} • {activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Button - Fixed Position */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-[#4E7B22] text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostDashboard;