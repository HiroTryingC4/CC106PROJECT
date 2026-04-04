import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  HomeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostFinancial = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
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

  const [expenses, setExpenses] = useState(isVerified ? [
    {
      id: 1,
      date: '2/24/2026',
      type: 'Marketing expense',
      description: '2',
      property: 'Trial#1',
      amount: 2000,
      category: 'Marketing Expenses'
    }
  ] : []); // Empty array for unverified hosts

  // Calculate totals automatically
  const calculateTotals = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const revenue = 21321; // This would come from bookings/payments in real app
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0.0';

    return {
      revenue: `₱${revenue.toLocaleString()}`,
      expenses: `₱${totalExpenses.toLocaleString()}`,
      netProfit: `₱${netProfit.toLocaleString()}`,
      profitMargin: `${profitMargin}%`,
      totalExpenses
    };
  };

  const financialData = calculateTotals();

  // Calculate expenses by category
  const calculateExpensesByCategory = () => {
    const categories = [
      'Maintenance costs',
      'Utilities costs', 
      'Cleaning services costs',
      'Supplies and Inventory',
      'Property Improvements',
      'Insurance and Taxes',
      'Marketing Expenses',
      'Other operational costs'
    ];

    return categories.map(category => {
      const categoryTotal = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: category,
        amount: categoryTotal > 0 ? `₱${categoryTotal.toLocaleString()}` : '₱0'
      };
    });
  };

  const expenseCategories = calculateExpensesByCategory();

  const securityDeposits = isVerified ? [
    {
      bookingId: '#17',
      unit: 'Trial#1',
      guests: 2,
      amount: '2,000',
      status: 'Held',
      checkOut: '2/24/2026'
    },
    {
      bookingId: '#18',
      unit: 'Trial#2',
      guests: 2,
      amount: '2,000',
      status: 'Held',
      checkOut: '2/24/2026'
    },
    {
      bookingId: '#19',
      unit: 'Trial#3',
      guests: 2,
      amount: '2,000',
      status: 'Held',
      checkOut: '2/24/2026'
    }
  ] : []; // Empty array for unverified hosts

  const expenseHistory = isVerified ? [
    {
      date: '2/24/2026',
      type: 'Marketing expense',
      description: '2',
      property: 'Trial#1',
      amount: '2,000'
    }
  ] : []; // Empty array for unverified hosts

  // Add Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    property: '',
    amount: ''
  });

  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  const handleCloseModal = () => {
    setShowAddExpenseModal(false);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      property: '',
      amount: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const newExpense = {
      id: expenses.length + 1,
      date: expenseForm.date,
      type: expenseForm.category,
      description: expenseForm.description,
      property: expenseForm.property || 'General',
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category
    };

    setExpenses(prev => [...prev, newExpense]);
    handleCloseModal();
  };

  const properties = ['Trial#1', 'Trial#2', 'Trial#3', 'General'];

  const handleEditExpense = (expenseId) => {
    console.log(`Editing expense ${expenseId}`);
    // In real app, this would open edit expense modal
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-gray-600 mt-1">Comprehensive financial tracking and management</p>
          </div>
          
          {/* Export Buttons */}
          {activeTab === 'overview' && (
            <div className="flex items-center space-x-2">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Export CSV
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Export JSON
              </button>
            </div>
          )}
          
          {/* Add Expenses Button */}
          {activeTab === 'expenses' && (
            <button
              onClick={handleAddExpense}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center space-x-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <PlusIcon className="w-3 h-3" />
              </div>
              <span>Add Expenses</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Financial Overview
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expense Tracking
            </button>
          </nav>
        </div>

        {/* Financial Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!isVerified ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-yellow-900">Verification Required</h3>
                    <p className="mt-2 text-sm text-yellow-800">
                      Your account is not yet verified. Complete and submit your verification documents to access financial data and start earning.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/host/verification'}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Complete Verification
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-green-700">Revenue</h3>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-700 mb-1">{financialData.revenue}</p>
                    <p className="text-sm text-green-600">Total earnings</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-red-700">Expenses</h3>
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-700 mb-1">{financialData.expenses}</p>
                    <p className="text-sm text-red-600">Actual costs</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-blue-700">Net Profit</h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-700 mb-1">{financialData.netProfit}</p>
                    <p className="text-sm text-blue-600">{financialData.profitMargin} Margin</p>
                  </div>
                </div>

                {/* Revenue vs Expenses Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs. Expenses (Monthly)</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600 font-medium">Revenue {financialData.revenue}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-600 font-medium">Expenses {financialData.expenses}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visual Bar Chart */}
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-green-500 rounded-full" 
                      style={{ width: `${(21321 / (21321 + financialData.totalExpenses)) * 100}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 h-full bg-red-500" 
                      style={{ 
                        left: `${(21321 / (21321 + financialData.totalExpenses)) * 100}%`,
                        width: `${(financialData.totalExpenses / (21321 + financialData.totalExpenses)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            {/* Security Deposits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Security Deposits</h3>
                  {isVerified ? (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">Total: ₱6,000</span>
                      <span className="text-green-600">Returned: ₱0</span>
                      <span className="text-yellow-600">Held: ₱6,000</span>
                    </div>
                  ) : null}
                </div>
              </div>
              
              {isVerified && securityDeposits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {securityDeposits.map((deposit) => (
                        <tr key={deposit.bookingId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {deposit.bookingId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deposit.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deposit.guests}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deposit.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              {deposit.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deposit.checkOut}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No security deposits available</h3>
                  <p className="text-gray-600 mb-6">Complete verification to view and manage security deposits.</p>
                  <a
                    href="/host/verification"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                  >
                    <span>Complete Verification</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expense Tracking Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {!isVerified ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-yellow-900">Verification Required</h3>
                    <p className="mt-2 text-sm text-yellow-800">
                      Your account is not yet verified. Complete and submit your verification documents to track and manage expenses.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/host/verification'}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Complete Verification
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Expense Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {expenseCategories.map((category, index) => {
                const icons = ['🔧', '⚡', '🧹', '📦', '🏗️', '🛡️', '📢', '⚙️'];
                const colors = [
                  'from-orange-50 to-amber-50 border-orange-100',
                  'from-yellow-50 to-amber-50 border-yellow-100', 
                  'from-blue-50 to-cyan-50 border-blue-100',
                  'from-purple-50 to-violet-50 border-purple-100',
                  'from-green-50 to-emerald-50 border-green-100',
                  'from-red-50 to-rose-50 border-red-100',
                  'from-pink-50 to-rose-50 border-pink-100',
                  'from-gray-50 to-slate-50 border-gray-100'
                ];
                
                return (
                  <div key={index} className={`bg-gradient-to-br ${colors[index]} p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{icons[index]}</span>
                      <div className="w-8 h-8 bg-white bg-opacity-50 rounded-full flex items-center justify-center group-hover:bg-opacity-70 transition-all">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2 leading-tight">{category.name}</h3>
                    <p className="text-xl font-bold text-gray-900">{category.amount}</p>
                  </div>
                );
              })}
            </div>

            {/* Total Expenses Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs. Expenses (Monthly)</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">₱{financialData.totalExpenses.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-900">{expenses.length}</p>
                </div>
              </div>
            </div>

            {/* Expense History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Expense History</h3>
                  {isVerified && expenses.length > 0 ? (
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">Total: ₱{financialData.totalExpenses.toLocaleString()}</span>
                      <span className="text-blue-600">Entries: {expenses.length}</span>
                    </div>
                  ) : null}
                </div>
              </div>
              
              {isVerified && expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {expense.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.property}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₱{expense.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            <button
                              onClick={() => handleEditExpense(expense.id)}
                              className="hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No expense history available</h3>
                  <p className="text-gray-600 mb-6">Complete verification to start tracking your expenses.</p>
                  <a
                    href="/host/verification"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                  >
                    <span>Complete Verification</span>
                  </a>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        )}

        {/* Fixed Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-[#4E7B22] text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="font-medium">Chat</span>
          </button>
        </div>

        {/* Add Expense Modal */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <PlusIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
                    <p className="text-sm text-gray-600">Track your property expenses</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitExpense} className="p-6 space-y-6">
                {/* Date Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-green-600" />
                    <span>Date *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={expenseForm.date}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      required
                    />
                    <CalendarIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Category Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <TagIcon className="w-4 h-4 text-green-600" />
                    <span>Expense Category *</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={expenseForm.category}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Maintenance costs">🔧 Maintenance costs</option>
                      <option value="Utilities costs">⚡ Utilities costs</option>
                      <option value="Cleaning services costs">🧹 Cleaning services costs</option>
                      <option value="Supplies and Inventory">📦 Supplies and Inventory</option>
                      <option value="Property Improvements">🏗️ Property Improvements</option>
                      <option value="Insurance and Taxes">🛡️ Insurance and Taxes</option>
                      <option value="Marketing Expenses">📢 Marketing Expenses</option>
                      <option value="Other operational costs">⚙️ Other operational costs</option>
                    </select>
                    <TagIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <div className="absolute right-4 top-3.5 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Property Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <HomeIcon className="w-4 h-4 text-green-600" />
                    <span>Property</span>
                  </label>
                  <div className="relative">
                    <select
                      name="property"
                      value={expenseForm.property}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                    >
                      <option value="">Select property</option>
                      {properties.map(property => (
                        <option key={property} value={property}>
                          {property === 'General' ? '🏢 General' : `🏠 ${property}`}
                        </option>
                      ))}
                    </select>
                    <HomeIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <div className="absolute right-4 top-3.5 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <DocumentTextIcon className="w-4 h-4 text-green-600" />
                    <span>Description *</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={expenseForm.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                      placeholder="Enter detailed expense description..."
                      required
                    />
                    <DocumentTextIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Amount Field */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <BanknotesIcon className="w-4 h-4 text-green-600" />
                    <span>Amount (₱) *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg font-medium"
                      placeholder="0.00"
                      required
                    />
                    <BanknotesIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <span className="absolute left-12 top-3.5 text-gray-500 font-medium">₱</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostFinancial;