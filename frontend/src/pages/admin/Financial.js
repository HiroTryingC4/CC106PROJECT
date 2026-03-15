import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const Financial = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  const financialStats = [
    { name: 'Total Revenue', value: '₱2,847,392', change: '+12.5%', trend: 'up', icon: CurrencyDollarIcon },
    { name: 'Commission Earned', value: '₱284,739', change: '+8.3%', trend: 'up', icon: BanknotesIcon },
    { name: 'Pending Payouts', value: '₱156,420', change: '-5.2%', trend: 'down', icon: CreditCardIcon },
    { name: 'Transaction Volume', value: '8,547', change: '+15.7%', trend: 'up', icon: ChartBarIcon },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'booking_payment',
      amount: 2500,
      currency: '₱',
      description: 'Booking payment for Luxury Beachfront Condo',
      user: 'John Doe',
      status: 'completed',
      timestamp: '2024-03-15 14:30:25',
      commission: 250
    },
    {
      id: 2,
      type: 'host_payout',
      amount: -1800,
      currency: '₱',
      description: 'Payout to host Jane Smith',
      user: 'Jane Smith',
      status: 'completed',
      timestamp: '2024-03-15 13:45:12',
      commission: 0
    },
    {
      id: 3,
      type: 'refund',
      amount: -1200,
      currency: '₱',
      description: 'Refund for cancelled booking',
      user: 'Mike Johnson',
      status: 'pending',
      timestamp: '2024-03-15 12:20:33',
      commission: -120
    },
    {
      id: 4,
      type: 'booking_payment',
      amount: 3500,
      currency: '₱',
      description: 'Booking payment for Beach House Villa',
      user: 'Sarah Wilson',
      status: 'completed',
      timestamp: '2024-03-15 11:15:45',
      commission: 350
    },
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 2100000, commission: 210000, transactions: 6500 },
    { month: 'Feb', revenue: 2300000, commission: 230000, transactions: 7200 },
    { month: 'Mar', revenue: 2847392, commission: 284739, transactions: 8547 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'booking_payment': return 'bg-blue-100 text-blue-800';
      case 'host_payout': return 'bg-purple-100 text-purple-800';
      case 'refund': return 'bg-red-100 text-red-800';
      case 'commission': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Financial Dashboard</h2>
            <p className="text-gray-600 mt-2">Monitor revenue, transactions, and financial metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendIcon className={`w-4 h-4 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last {selectedPeriod}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'transactions', 'payouts', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <ChartBarIcon className="w-16 h-16 mx-auto mb-4" />
                        <p>Revenue chart would be displayed here</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Units */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Units</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Luxury Beachfront Condo', revenue: '₱125,000', bookings: 45 },
                        { name: 'Modern City Apartment', revenue: '₱98,500', bookings: 38 },
                        { name: 'Beach House Villa', revenue: '₱87,200', bookings: 22 },
                        { name: 'Cozy Mountain Cabin', revenue: '₱76,800', bookings: 41 },
                      ].map((unit, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded">
                          <div>
                            <p className="font-medium text-gray-900">{unit.name}</p>
                            <p className="text-sm text-gray-600">{unit.bookings} bookings</p>
                          </div>
                          <span className="font-semibold text-green-600">{unit.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                                {transaction.type.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.user}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.currency}{Math.abs(transaction.amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${transaction.commission > 0 ? 'text-green-600' : transaction.commission < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {transaction.commission > 0 ? '+' : ''}{transaction.currency}{transaction.commission}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Host Payouts</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Payout Management</h4>
                  <p className="text-gray-600 mb-4">Manage host payouts and commission distributions</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Process Payouts
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Monthly Revenue Report</h4>
                    <p className="text-sm text-gray-600 mb-4">Detailed breakdown of monthly revenue and commissions</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      Generate Report
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Tax Summary</h4>
                    <p className="text-sm text-gray-600 mb-4">Annual tax summary for financial reporting</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      Download Summary
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Financial;