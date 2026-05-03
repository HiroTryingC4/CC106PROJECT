import React, { useState, useEffect } from 'react';
import CommunicationAdminLayout from '../../components/common/CommunicationAdminLayout';
import { 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const CommunicationAdminChatbotAnalytics = () => {
  const { token } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [showAllConversations, setShowAllConversations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      name: 'Total Conversations',
      value: '0',
      change: '+12%',
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Active Users',
      value: '0',
      change: '+8%',
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Avg Response Time',
      value: '0s',
      change: '-15%',
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Success Rate',
      value: '0%',
      change: '+3%',
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'bg-purple-500'
    }
  ]);
  const [performance, setPerformance] = useState({
    resolutionRate: 0,
    userSatisfaction: 0,
    escalationRate: 0,
    peakHours: 'N/A',
    busiestDay: 'N/A',
    avgSessionLength: '0m 0s',
    returnUsers: 0
  });
  const [recentConversations, setRecentConversations] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [token, selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch stats
      const statsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/comm-admin/chatbot/analytics/stats?timeRange=${selectedTimeRange}`,
        { credentials: 'include', headers }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats([
          {
            name: 'Total Conversations',
            value: statsData.totalConversations.toLocaleString(),
            change: '+12%',
            changeType: 'increase',
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-green-500'
          },
          {
            name: 'Active Users',
            value: statsData.activeUsers.toLocaleString(),
            change: '+8%',
            changeType: 'increase',
            icon: UserGroupIcon,
            color: 'bg-blue-500'
          },
          {
            name: 'Avg Response Time',
            value: `${statsData.avgResponseTime}s`,
            change: '-15%',
            changeType: 'decrease',
            icon: ClockIcon,
            color: 'bg-yellow-500'
          },
          {
            name: 'Success Rate',
            value: `${statsData.successRate}%`,
            change: '+3%',
            changeType: 'increase',
            icon: CheckCircleIcon,
            color: 'bg-purple-500'
          }
        ]);
      }

      // Fetch performance metrics
      const performanceResponse = await fetch(
        `${API_CONFIG.BASE_URL}/comm-admin/chatbot/analytics/performance?timeRange=${selectedTimeRange}`,
        { credentials: 'include', headers }
      );

      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformance(performanceData);
      }

      // Fetch conversations
      const conversationsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/comm-admin/chatbot/analytics/conversations?limit=10`,
        { credentials: 'include', headers }
      );

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        setRecentConversations(conversationsData);
      }

      // Fetch top questions
      const topQuestionsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/comm-admin/chatbot/analytics/top-questions?timeRange=${selectedTimeRange}&limit=5`,
        { credentials: 'include', headers }
      );

      if (topQuestionsResponse.ok) {
        const topQuestionsData = await topQuestionsResponse.json();
        setTopQuestions(topQuestionsData);
      }

      // Fetch unanswered questions
      const unansweredResponse = await fetch(
        `${API_CONFIG.BASE_URL}/comm-admin/chatbot/analytics/unanswered-questions?timeRange=${selectedTimeRange}&limit=4`,
        { credentials: 'include', headers }
      );

      if (unansweredResponse.ok) {
        const unansweredData = await unansweredResponse.json();
        setUnansweredQuestions(unansweredData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSatisfactionColor = (satisfaction) => {
    switch (satisfaction) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSatisfactionIcon = (satisfaction) => {
    switch (satisfaction) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '❓';
    }
  };

  // Function to get displayed conversations based on view state
  const getDisplayedConversations = () => {
    return showAllConversations ? recentConversations : recentConversations.slice(0, 4);
  };

  const handleViewAllToggle = () => {
    setShowAllConversations(!showAllConversations);
  };

  return (
    <CommunicationAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Chatbot Analytics & Monitoring</h2>
            <p className="text-gray-600 mt-2">Monitor chatbot performance and user interactions</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4E7B22] focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color}`}>
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

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <span className="text-sm font-medium text-gray-900">{performance.resolutionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: `${performance.resolutionRate}%`}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <span className="text-sm font-medium text-gray-900">{performance.userSatisfaction}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${performance.userSatisfaction}%`}}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Escalation Rate</span>
                <span className="text-sm font-medium text-gray-900">{performance.escalationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${performance.escalationRate}%`}}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activity Trends</h3>
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Peak Hours</span>
                <span className="text-sm font-medium text-gray-900">{performance.peakHours}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Busiest Day</span>
                <span className="text-sm font-medium text-gray-900">{performance.busiestDay}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Session Length</span>
                <span className="text-sm font-medium text-gray-900">{performance.avgSessionLength}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Return Users</span>
                <span className="text-sm font-medium text-gray-900">{performance.returnUsers}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Questions and Unanswered Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Questions</h3>
            {topQuestions.length > 0 ? (
              <div className="space-y-4">
                {topQuestions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.question}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{width: `${item.percentage}%`}}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{item.count} asks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions data available</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Unanswered Questions</h3>
            {unansweredQuestions.length > 0 ? (
              <div className="space-y-4">
                {unansweredQuestions.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.question}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs text-red-600">{item.count} times</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                      </div>
                    </div>
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No unanswered questions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
              <p className="text-sm text-gray-600 mt-1">
                Showing {getDisplayedConversations().length} of {recentConversations.length} conversations
              </p>
            </div>
            <button 
              onClick={handleViewAllToggle}
              className="flex items-center space-x-2 px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-green-700"
            >
              <EyeIcon className="w-4 h-4" />
              <span>{showAllConversations ? 'Show Less' : 'View All'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentConversations.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getDisplayedConversations().map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {conversation.user.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{conversation.user}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conversation.messages}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conversation.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(conversation.status)}`}>
                          {conversation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getSatisfactionIcon(conversation.satisfaction)}</span>
                          <span className={`text-sm font-medium ${getSatisfactionColor(conversation.satisfaction)}`}>
                            {conversation.satisfaction}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {conversation.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No conversations available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CommunicationAdminLayout>
  );
};

export default CommunicationAdminChatbotAnalytics;