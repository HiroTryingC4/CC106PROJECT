import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostPayments = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch verification status when component mounts
    const fetchVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/host/verification-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(data);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  // Check if user is verified
  const isVerified = verificationStatus?.status === 'verified';

  const paymentSummary = {
    totalRevenue: isVerified ? '$6,470' : '$0',
    revenueGrowth: isVerified ? '+18% vs last month' : '',
    completedTransactions: isVerified ? 6 : 0,
    pendingTransactions: isVerified ? 2 : 0,
    avgTransaction: isVerified ? '$1,078' : '$0'
  };

  const pendingDeposits = isVerified ? [
    {
      id: 1,
      name: 'Lisa Anderson',
      property: 'Desert Oasis',
      amount: '$500'
    },
    {
      id: 2,
      name: 'Rachel Green',
      property: 'Beach House',
      amount: '$300'
    }
  ] : [];

  const transactions = isVerified ? [
    {
      id: 'PAY-001',
      bookingId: 'BK-2024-001',
      guest: 'Sarah Johnson',
      unit: 'Sunset Villa',
      type: 'Booking',
      amount: '$1,350',
      date: 'Feb 15, 2026',
      status: 'Completed'
    },
    {
      id: 'PAY-002',
      bookingId: 'BK-2024-002',
      guest: 'Michael Chen',
      unit: 'Ocean View Apartment',
      type: 'Booking',
      amount: '$980',
      date: 'Feb 14, 2026',
      status: 'Completed'
    },
    {
      id: 'PAY-003',
      bookingId: 'BK-2024-003',
      guest: 'Emma Williams',
      unit: 'Mountain Cabin',
      type: 'Booking',
      amount: '$2,380',
      date: 'Feb 13, 2026',
      status: 'Completed'
    },
    {
      id: 'PAY-004',
      bookingId: 'BK-2024-004',
      guest: 'David Brown',
      unit: 'City Loft',
      type: 'Booking',
      amount: '$560',
      date: 'Feb 16, 2026',
      status: 'Completed'
    },
    {
      id: 'PAY-005',
      bookingId: 'BK-2024-005',
      guest: 'Lisa Walker',
      unit: 'Desert Oasis',
      type: 'Deposit',
      amount: '$500',
      date: 'Feb 18, 2026',
      status: 'Pending'
    },
    {
      id: 'PAY-006',
      bookingId: 'BK-2024-006',
      guest: 'James Wilson',
      unit: 'Sunset Villa',
      type: 'Booking',
      amount: '$1,200',
      date: 'Feb 17, 2026',
      status: 'Completed'
    },
    {
      id: 'PAY-007',
      bookingId: 'BK-2024-007',
      guest: 'Rachel Green',
      unit: 'Beach House',
      type: 'Deposit',
      amount: '$300',
      date: 'Feb 19, 2026',
      status: 'Pending'
    },
    {
      id: 'PAY-008',
      bookingId: 'BK-2024-008',
      guest: 'Tom Anderson',
      unit: 'City Loft',
      type: 'Refund',
      amount: '$450',
      date: 'Feb 12, 2026',
      status: 'Completed'
    }
  ] : []; // Empty array for unverified hosts

  const handleApproveDeposit = (depositId) => {
    console.log(`Approving deposit ${depositId}`);
    // In real app, this would call an API
  };

  const handleDeclineDeposit = (depositId) => {
    console.log(`Declining deposit ${depositId}`);
    // In real app, this would call an API
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Booking': return 'bg-blue-100 text-blue-800';
      case 'Deposit': return 'bg-blue-100 text-blue-800';
      case 'Refund': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track all transactions and revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">{paymentSummary.totalRevenue}</p>
                <p className="text-sm text-green-600 mt-1">{paymentSummary.revenueGrowth}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Completed Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-gray-900">{paymentSummary.completedTransactions}</p>
                <p className="text-sm text-gray-500 mt-1">Transactions</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-gray-900">{paymentSummary.pendingTransactions}</p>
                <p className="text-sm text-red-500 mt-1">Requires Action</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Average Transaction */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Transaction</h3>
                <p className="text-3xl font-bold text-gray-900">{paymentSummary.avgTransaction}</p>
                <p className="text-sm text-gray-500 mt-1">Per Booking</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Deposits Section */}
        {isVerified && pendingDeposits.length > 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Pending Deposits ({pendingDeposits.length})</h3>
            </div>
            
            <div className="space-y-4">
              {pendingDeposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-yellow-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{deposit.name}</h4>
                    <p className="text-sm text-gray-600">{deposit.property} • {deposit.amount}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeclineDeposit(deposit.id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveDeposit(deposit.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !isVerified ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment features locked</h3>
              <p className="text-gray-600 mb-6">Complete verification to access payment management and transaction history.</p>
              <a
                href="/host/verification"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
              >
                <span>Complete Verification</span>
              </a>
            </div>
          </div>
        ) : null}

        {/* All Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          </div>
          
          {isVerified && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.guest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions available</h3>
              <p className="text-gray-600">Complete verification to view your transaction history.</p>
            </div>
          )}
        </div>

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

export default HostPayments;