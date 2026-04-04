import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { 
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarDaysIcon,
  PercentBadgeIcon,
  CheckIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostPromoCodes = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    minBookingAmount: ''
  });
  const promoCodes = isVerified ? [
    {
      id: 1,
      code: 'SUMMER2024',
      type: 'percentage',
      value: 20,
      description: 'Summer vacation discount',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      usageLimit: 100,
      usedCount: 23,
      minBookingAmount: 5000,
      status: 'active',
      totalSavings: '₱45,600'
    },
    {
      id: 2,
      code: 'WELCOME500',
      type: 'fixed',
      value: 500,
      description: 'New guest welcome discount',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usageLimit: 50,
      usedCount: 12,
      minBookingAmount: 3000,
      status: 'active',
      totalSavings: '₱6,000'
    },
    {
      id: 3,
      code: 'LONGSTAY',
      type: 'percentage',
      value: 15,
      description: 'Extended stay discount (7+ nights)',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      usageLimit: 25,
      usedCount: 8,
      minBookingAmount: 10000,
      status: 'active',
      totalSavings: '₱18,400'
    },
    {
      id: 4,
      code: 'SPRING2024',
      type: 'percentage',
      value: 25,
      description: 'Spring season special',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      usageLimit: 75,
      usedCount: 75,
      minBookingAmount: 4000,
      status: 'expired',
      totalSavings: '₱32,100'
    }
  ] : []; // Empty array for unverified hosts

  // Calculate stats
  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter(p => p.status === 'active').length;
  const totalUsage = promoCodes.reduce((sum, p) => sum + p.usedCount, 0);
  const totalSavings = promoCodes.reduce((sum, p) => {
    const amount = parseInt(p.totalSavings.replace('₱', '').replace(',', ''));
    return sum + amount;
  }, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePromo = (e) => {
    e.preventDefault();
    // Handle promo code creation
    console.log('Creating promo code:', newPromo);
    setShowCreateModal(false);
    setNewPromo({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      minBookingAmount: ''
    });
  };

  return (
    <HostLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
            <p className="text-gray-500 mt-1">Create and manage discount codes for your properties</p>
          </div>
          {/* Create Promo Codes Button */}
          {isVerified ? (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Promo Codes</span>
            </button>
          ) : (
            <a
              href="/host/verification"
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center space-x-2 font-medium"
              title="Complete verification to create promo codes"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Promo Codes</span>
            </a>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Codes</p>
                <p className="text-3xl font-bold text-gray-900">{isVerified ? totalCodes : 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TagIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Codes</p>
                <p className="text-3xl font-bold text-gray-900">{isVerified ? activeCodes : 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Usage</p>
                <p className="text-3xl font-bold text-gray-900">{isVerified ? totalUsage : 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Savings</p>
                <p className="text-3xl font-bold text-gray-900">₱{isVerified ? totalSavings.toLocaleString() : '0'}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Promo Codes Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Usage</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Expires</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!isVerified ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Promo codes locked</h3>
                        <p className="text-gray-600 mb-6">Complete verification to create and manage promo codes.</p>
                        <a
                          href="/host/verification"
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                        >
                          <span>Complete Verification</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ) : promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <TagIcon className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No promo codes yet. Create your first one!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{promo.code}</p>
                          <p className="text-sm text-gray-500">{promo.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {promo.type === 'percentage' ? (
                            <>
                              <PercentBadgeIcon className="w-4 h-4 text-green-500 mr-1" />
                              <span className="font-semibold text-green-600">{promo.value}%</span>
                            </>
                          ) : (
                            <span className="font-semibold text-green-600">₱{promo.value}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{promo.usedCount} / {promo.usageLimit}</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{promo.endDate}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promo.status)}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Promo Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Promo Code</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreatePromo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                      placeholder="e.g., SUMMER2024"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newPromo.type}
                      onChange={(e) => setNewPromo({...newPromo, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₱)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newPromo.value}
                      onChange={(e) => setNewPromo({...newPromo, value: e.target.value})}
                      placeholder={newPromo.type === 'percentage' ? '20' : '500'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newPromo.usageLimit}
                      onChange={(e) => setNewPromo({...newPromo, usageLimit: e.target.value})}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newPromo.description}
                    onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                    placeholder="Brief description of the promo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newPromo.startDate}
                      onChange={(e) => setNewPromo({...newPromo, startDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newPromo.endDate}
                      onChange={(e) => setNewPromo({...newPromo, endDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Booking Amount (₱)
                  </label>
                  <input
                    type="number"
                    value={newPromo.minBookingAmount}
                    onChange={(e) => setNewPromo({...newPromo, minBookingAmount: e.target.value})}
                    placeholder="3000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2"
                  >
                    <TagIcon className="w-4 h-4" />
                    <span>Create Promo Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
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

export default HostPromoCodes;