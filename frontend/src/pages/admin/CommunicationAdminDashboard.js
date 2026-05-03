import React, { useState, useEffect } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState([
    {
      name: 'Total Messages',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'blue'
    },
    {
      name: 'Chatbot Conversations',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      name: 'Response Time',
      value: '0h',
      change: '0%',
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'yellow'
    },
    {
      name: 'Success Rate',
      value: '0%',
      change: '+0%',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'purple'
    }
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/dashboard/stats`, {
        credentials: 'include',
        headers
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats([
          {
            name: 'Total Messages',
            value: statsData.totalMessages.toLocaleString(),
            change: '+12%',
            changeType: 'increase',
            icon: ChatBubbleLeftRightIcon,
            color: 'blue'
          },
          {
            name: 'Chatbot Conversations',
            value: statsData.chatbotConversations.toLocaleString(),
            change: '+8%',
            changeType: 'increase',
            icon: UserGroupIcon,
            color: 'green'
          },
          {
            name: 'Response Time',
            value: `${statsData.avgResponseTime}h`,
            change: '-15%',
            changeType: 'decrease',
            icon: ClockIcon,
            color: 'yellow'
          },
          {
            name: 'Success Rate',
            value: `${statsData.successRate}%`,
            change: '+3%',
            changeType: 'increase',
            icon: CheckCircleIcon,
            color: 'purple'
          }
        ]);
      }

      // Fetch recent activity
      const activityResponse = await fetch(`${API_CONFIG.BASE_URL}/comm-admin/dashboard/activity`, {
        credentials: 'include',
        headers
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'message': return ChatBubbleLeftRightIcon;
      case 'chatbot': return UserGroupIcon;
      case 'alert': return ExclamationTriangleIcon;
      default: return CheckCircleIcon;
    }
  };

  const getActivityIconBg = (type) => {
    switch (type) {
      case 'message': return 'bg-blue-100';
      case 'chatbot': return 'bg-green-100';
      case 'alert': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  const getActivityIconColor = (type) => {
    switch (type) {
      case 'message': return 'text-blue-600';
      case 'chatbot': return 'text-green-600';
      case 'alert': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Communication Dashboard</h2>
          <p className="text-gray-600 mt-2">Monitor messages and chatbot performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${getStatColor(stat.color)}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <span className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/comm-admin/messages"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-900 font-medium">View Messages</span>
              </Link>
              <Link
                to="/comm-admin/chatbot-analytics"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <ChartBarIcon className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-900 font-medium">Chatbot Analytics</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                {recentActivity.length} Updates
              </span>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div 
                    key={activity.id} 
                    className="group relative rounded-xl border border-gray-200 p-4 transition-all hover:border-green-300 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 p-3 rounded-xl ${getActivityIconBg(activity.type)}`}>
                        <Icon className={`w-5 h-5 ${getActivityIconColor(activity.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                          <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    {activity.priority === 'urgent' && (
                      <div className="absolute top-2 right-2">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <Link
                to="/comm-admin/messages"
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminDashboard;