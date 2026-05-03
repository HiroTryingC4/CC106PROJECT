import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ChatbotAnalytics = () => {
  const navigate = useNavigate();

  const topQuestions = [
    { id: 1, question: "How do I book a unit?", timesAsked: 48 },
    { id: 2, question: "What payment methods do you accept?", timesAsked: 35 },
    { id: 3, question: "What is the cancellation policy?", timesAsked: 28 },
    { id: 4, question: "How do I check-in?", timesAsked: 22 },
    { id: 5, question: "What about the security deposits?", timesAsked: 18 }
  ];

  const unansweredQuestions = [
    { question: "how to contact support?", times: 8 },
    { question: "refund status check", times: 8 },
    { question: "change booking date", times: 8 },
    { question: "How to contact support?", times: 8 },
    { question: "How to contact support?", times: 8 }
  ];

  const activityTrends = [
    { date: "Feb 14", messages: 95, bar: 18 },
    { date: "Feb 15", messages: 110, bar: 22 },
    { date: "Feb 16", messages: 125, bar: 25 },
    { date: "Feb 17", messages: 98, bar: 20 },
    { date: "Feb 18", messages: 92, bar: 19 },
    { date: "Feb 19", messages: 142, bar: 28 },
    { date: "Feb 20", messages: 120, bar: 24 }
  ];

  const recentConversations = [
    { time: "Feb 20, 07:00 PM", userRole: "guest", messages: 1, conversationId: "conv_7" },
    { time: "Feb 20, 06:45 PM", userRole: "guest", messages: 1, conversationId: "conv_6" },
    { time: "Feb 20, 06:30 PM", userRole: "host", messages: 1, conversationId: "conv_5" },
    { time: "Feb 20, 06:15 PM", userRole: "guest", messages: 1, conversationId: "conv_4" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Simple Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4">
          <button 
            onClick={() => navigate('/admin/messages')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">Chatbot Analytics and Monitoring</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">Track chatbot performance and user interactions</p>
          </div>
        </div>

        {/* Simple Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 sm:text-4xl">156</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Messages</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 sm:text-4xl">782</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600 sm:text-4xl">85</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg. Response Time</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600 sm:text-4xl">1.15s</p>
          </div>
        </div>

        {/* Simple Performance Overview */}
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="rounded-2xl bg-green-50 p-4">
              <div className="text-2xl font-bold text-green-600">782</div>
              <div className="text-sm text-green-700">Successful Responses</div>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <div className="text-2xl font-bold text-red-600">22</div>
              <div className="text-sm text-red-700">Fallback Triggers</div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <div className="text-2xl font-bold text-blue-600">90.18%</div>
              <div className="text-sm text-blue-700">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Enhanced Top 5 Most Asked Questions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Top 5 Most Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {topQuestions.map((item, index) => (
              <div key={item.id} className="group rounded-xl border border-gray-100 p-4 transition-colors duration-200 hover:bg-gray-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      'bg-gradient-to-r from-[#4E7B22] to-[#6B9B2F]'
                    }`}>
                      {item.id}
                    </div>
                    <span className="text-gray-900 font-medium group-hover:text-[#4E7B22] transition-colors duration-200">
                      {item.question}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl font-bold text-blue-600">{item.timesAsked}</div>
                    <div className="text-xs text-gray-500">times asked</div>
                  </div>
                </div>
                <div className="mt-3 ml-0 sm:ml-14">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.timesAsked / 48) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Unanswered Questions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Unanswered Questions (Fallback Triggers)</h3>
                <p className="text-sm text-gray-600">Add these to FAQs to improve chatbot performance</p>
              </div>
            </div>
            <div className="inline-flex w-fit px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Needs Attention
            </div>
          </div>
          <div className="space-y-3">
            {unansweredQuestions.map((item, index) => (
              <div key={index} className="group rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-200 rounded-full">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-medium">"{item.question}"</span>
                      <div className="text-xs text-gray-600 mt-1">Suggested action: Add to FAQ database</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                      {item.times} times
                    </span>
                    <button className="px-3 py-1 bg-[#4E7B22] text-white rounded-lg text-sm hover:bg-[#3d6219] transition-colors duration-200">
                      Add FAQ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Activity Trends */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Activity Trends (Last 7 Days)</h3>
              <p className="text-sm text-gray-600">Daily message volume and engagement patterns</p>
            </div>
          </div>
          <div className="space-y-4">
            {activityTrends.map((day, index) => (
              <div key={index} className="group rounded-xl p-3 transition-colors duration-200 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-gray-700">{day.date}</div>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="bg-gradient-to-r from-[#4E7B22] to-[#6B9B2F] h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${day.bar}%` }}
                    >
                      {day.bar}%
                    </div>
                  </div>
                  <div className="w-20 text-sm font-medium text-gray-700 text-right">
                    <div className="text-lg font-bold text-[#4E7B22]">{day.messages}</div>
                    <div className="text-xs text-gray-500">messages</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Recent Conversations */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Recent Conversations</h3>
                <p className="text-sm text-gray-600">Latest chatbot interactions and user sessions</p>
              </div>
            </div>
            <button className="inline-flex w-fit px-4 py-2 bg-[#4E7B22] text-white rounded-lg hover:bg-[#3d6219] transition-colors duration-200 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3 sm:hidden">
            {recentConversations.map((conv, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{conv.time}</p>
                    <span className={`mt-2 inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      conv.userRole === 'guest'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {conv.userRole}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#4E7B22]">{conv.messages}</p>
                    <p className="text-xs text-gray-500">messages</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">Conversation ID: {conv.conversationId}</div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Time</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User Role</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Messages</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Conversation ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentConversations.map((conv, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{conv.time}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        conv.userRole === 'guest' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {conv.userRole}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{conv.messages}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-mono">{conv.conversationId}</td>
                    <td className="py-4 px-6">
                      <button className="text-[#4E7B22] hover:text-[#3d6219] text-sm font-medium hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatbotAnalytics;