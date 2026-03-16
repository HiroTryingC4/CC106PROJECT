import React, { useState } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  HomeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const HostReports = () => {
  const [activeTab, setActiveTab] = useState('revenue');

  // Analytics data
  const analyticsData = {
    totalRevenue: {
      value: '$161,130',
      change: '+15.3% YoY',
      trend: 'up'
    },
    totalBookings: {
      value: '216',
      change: '+8.2% vs last period',
      trend: 'up'
    },
    avgOccupancy: {
      value: '68%',
      change: '+5% vs last month',
      trend: 'up'
    },
    totalGuests: {
      value: '847',
      change: '+12% vs last period',
      trend: 'up'
    }
  };

  // Revenue chart data (last 7 months)
  const revenueData = [
    { month: 'Aug', value: 18000 },
    { month: 'Sep', value: 23000 },
    { month: 'Oct', value: 20000 },
    { month: 'Nov', value: 26000 },
    { month: 'Dec', value: 29500 },
    { month: 'Jan', value: 22000 },
    { month: 'Feb', value: 24500 }
  ];

  // Bookings chart data (last 7 months)
  const bookingsData = [
    { month: 'Aug', value: 25 },
    { month: 'Sep', value: 31 },
    { month: 'Oct', value: 28 },
    { month: 'Nov', value: 35 },
    { month: 'Dec', value: 41 },
    { month: 'Jan', value: 29 },
    { month: 'Feb', value: 27 }
  ];

  // Unit performance data
  const unitPerformance = [
    { name: 'Beach House', performance: 0.48 },
    { name: 'Ocean View', performance: 0.45 },
    { name: 'Desert Oasis', performance: 0.4 },
    { name: 'City Loft', performance: 0.35 },
    { name: 'Mountain Cabin', performance: 0.33 },
    { name: 'Sunset Villa', performance: 0.3 }
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.value));
  const maxBookings = Math.max(...bookingsData.map(d => d.value));

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
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {analyticsData.totalRevenue.change}
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
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {analyticsData.totalBookings.change}
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
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {analyticsData.avgOccupancy.change}
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
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {analyticsData.totalGuests.change}
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
            
            {/* Area Chart */}
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
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking (Last 7 Months)</h3>
            
            {/* Bar Chart */}
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
          </div>
        )}

        {/* Unit Performance Tab */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends (Last 7 Months)</h3>
            
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
          </div>
        )}

        {/* Fixed Chat Button */}
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

export default HostReports;