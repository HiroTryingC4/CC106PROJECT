import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
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
  const { token } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState({
    stats: {
      totalRevenue: 0,
      commissionEarned: 0,
      pendingPayouts: 0,
      transactionVolume: 0,
      changes: { revenue: '+0%', commission: '+0%', transactions: '+0%' }
    },
    transactions: [],
    topProperties: [],
    monthlyData: []
  });

  useEffect(() => {
    fetchFinancialData();
  }, [token, selectedPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/admin/financial?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const data = await response.json();
      setFinancialData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Prepare CSV data
    const csvRows = [];
    
    // Add header
    csvRows.push('Financial Report - ' + selectedPeriod.toUpperCase());
    csvRows.push('Generated on: ' + new Date().toLocaleString());
    csvRows.push('');
    
    // Add stats section
    csvRows.push('FINANCIAL SUMMARY');
    csvRows.push('Metric,Value,Change');
    csvRows.push(`Total Revenue,₱${financialData.stats.totalRevenue.toLocaleString()},${financialData.stats.changes.revenue}`);
    csvRows.push(`Commission Earned,₱${financialData.stats.commissionEarned.toLocaleString()},${financialData.stats.changes.commission}`);
    csvRows.push(`Pending Payouts,₱${financialData.stats.pendingPayouts.toLocaleString()},-`);
    csvRows.push(`Transaction Volume,${financialData.stats.transactionVolume.toLocaleString()},${financialData.stats.changes.transactions}`);
    csvRows.push('');
    
    // Add transactions section
    csvRows.push('TRANSACTIONS');
    csvRows.push('ID,Type,Description,User,Amount,Commission,Status,Date');
    financialData.transactions.forEach(transaction => {
      csvRows.push([
        transaction.id,
        transaction.type,
        `"${transaction.description}"`,
        transaction.user,
        `₱${transaction.amount.toLocaleString()}`,
        `₱${transaction.commission}`,
        transaction.status,
        new Date(transaction.timestamp).toLocaleString()
      ].join(','));
    });
    csvRows.push('');
    
    // Add top properties section
    csvRows.push('TOP PERFORMING PROPERTIES');
    csvRows.push('Property Name,Revenue,Bookings');
    financialData.topProperties.forEach(property => {
      csvRows.push([
        `"${property.name}"`,
        property.revenue,
        property.bookings
      ].join(','));
    });
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const financialStats = [
    { 
      name: 'Total Revenue', 
      value: `₱${financialData.stats.totalRevenue.toLocaleString()}`, 
      change: financialData.stats.changes.revenue, 
      trend: financialData.stats.changes.revenue.startsWith('+') ? 'up' : 'down', 
      icon: CurrencyDollarIcon 
    },
    { 
      name: 'Commission Earned', 
      value: `₱${financialData.stats.commissionEarned.toLocaleString()}`, 
      change: financialData.stats.changes.commission, 
      trend: financialData.stats.changes.commission.startsWith('+') ? 'up' : 'down', 
      icon: BanknotesIcon 
    },
    { 
      name: 'Pending Payouts', 
      value: `₱${financialData.stats.pendingPayouts.toLocaleString()}`, 
      change: '-', 
      trend: 'down', 
      icon: CreditCardIcon 
    },
    { 
      name: 'Transaction Volume', 
      value: financialData.stats.transactionVolume.toLocaleString(), 
      change: financialData.stats.changes.transactions, 
      trend: financialData.stats.changes.transactions.startsWith('+') ? 'up' : 'down', 
      icon: ChartBarIcon 
    },
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading financial data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">Financial Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">Monitor revenue, transactions, and financial metrics</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 lg:w-auto lg:py-2"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button 
              onClick={exportToCSV}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 sm:w-auto lg:py-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {financialStats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
            return (
              <div key={stat.name} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.change !== '-' && (
                        <>
                          <TrendIcon className={`w-4 h-4 mr-1 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                          <span className={`text-sm font-medium ${
                            stat.change.startsWith('+') ? 'text-green-600' : 
                            stat.change.startsWith('-') ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">vs last {selectedPeriod}</span>
                        </>
                      )}
                      {stat.change === '-' && (
                        <span className="text-sm text-gray-500">Current pending amount</span>
                      )}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
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
            <nav className="flex min-w-max space-x-6 overflow-x-auto px-4 sm:space-x-8 sm:px-6">
              {['overview', 'transactions', 'payouts', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium ${
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

          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  {/* Revenue Chart Placeholder */}
                  <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Revenue Trend</h3>
                    <div className="flex h-52 items-center justify-center text-gray-500 sm:h-64">
                      <div className="text-center">
                        <ChartBarIcon className="w-16 h-16 mx-auto mb-4" />
                        <p>Revenue chart would be displayed here</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Units */}
                  <div className="rounded-2xl bg-gray-50 p-4 sm:p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Performing Units</h3>
                    <div className="space-y-3">
                      {financialData.topProperties.length > 0 ? financialData.topProperties.map((unit, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded">
                          <div>
                            <p className="font-medium text-gray-900">{unit.name}</p>
                            <p className="text-sm text-gray-600">{unit.bookings} bookings</p>
                          </div>
                          <span className="font-semibold text-green-600">{unit.revenue}</span>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-center py-4">No property data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</button>
                </div>
                
                <div className="space-y-3 sm:hidden">
                  {financialData.transactions.length > 0 ? financialData.transactions.map((transaction) => (
                    <div key={transaction.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900">{transaction.description}</div>
                          <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">User</p>
                          <p className="font-medium text-gray-900">{transaction.user}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Commission</p>
                          <p className={`font-medium ${transaction.commission > 0 ? 'text-green-600' : transaction.commission < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {transaction.commission > 0 ? '+' : ''}{transaction.currency}{transaction.commission}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                      No transactions found
                    </div>
                  )}
                </div>

                <div className="hidden overflow-x-auto sm:block">
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
                      {financialData.transactions.length > 0 ? financialData.transactions.map((transaction) => (
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
                              {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString()}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
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