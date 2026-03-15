import React from 'react';
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

const CommunicationAdminDashboard = () => {
  const stats = [
    {
      name: 'Total Messages',
      value: '12,847',
      change: '+12%',
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'blue'
    },
    {
      name: 'Chatbot Conversations',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      name: 'Response Time',
      value: '2.4h',
      change: '-15%',
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'yellow'
    },
    {
      name: 'Success Rate',
      value: '90.18%',
      change: '+3%',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'purple'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'message',
      description: 'New message from john.doe@example.com',
      time: '5 minutes ago',
      status: 'unread'
    },
    {
      id: 2,
      type: 'chatbot',
      description: 'Chatbot handled 15 new conversations',
      time: '10 minutes ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'alert',
      description: 'High volume of support requests detected',
      time: '1 hour ago',
      status: 'warning'
    },
    {
      id: 4,
      type: 'message',
      description: 'Flagged message requires review',
      time: '2 hours ago',
      status: 'urgent'
    }
  ];

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

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminDashboard;