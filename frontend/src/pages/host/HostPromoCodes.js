import React, { useState, useEffect } from 'react';
import HostLayout from '../../components/common/HostLayout';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TagIcon,
  PlusIcon,
  TrashIcon,
  PercentBadgeIcon,
  CheckIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const HostPromoCodes = () => {
  const { token, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState([]);
  const [error, setError] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // { promoId, promoCode }
  const [hostUnits, setHostUnits] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;

        const verifyResponse = await fetch(`${API_CONFIG.BASE_URL}/host/verification-status`, {
          headers: { 'Authorization': `Bearer ${token}` }, credentials: 'include'
        });
        if (verifyResponse.ok) {
          const data = await verifyResponse.json();
          setVerificationStatus(data);
          
          if (['verified', 'approved'].includes(data.status) || data.verified === true) {
            const [promoResponse, unitsResponse] = await Promise.all([
              fetch(`${API_CONFIG.ROOT}/api/promo-codes`, { headers: { 'Authorization': `Bearer ${token}` }, credentials: 'include' }),
              fetch(`${API_CONFIG.BASE_URL}/properties?hostId=${user?.id}`, { headers: { 'Authorization': `Bearer ${token}` }, credentials: 'include' })
            ]);
            if (promoResponse.ok) {
              const result = await promoResponse.json();
              setPromoCodes(result.data || result);
            }
            if (unitsResponse.ok) {
              const result = await unitsResponse.json();
              setHostUnits(result.properties || result.data || (Array.isArray(result) ? result : []));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Check if user is verified
  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

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

  // Calculate stats
  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter(p => p.status === 'active').length;
  const totalUsage = promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);
  const totalSavings = 0; // Calculate from booking data if needed

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openAssignModal = async (promo) => {
    setAssignModal({ promoId: promo.id, promoCode: promo.code });
    try {
      const res = await fetch(`${API_CONFIG.ROOT}/api/promo-codes/${promo.id}/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }, credentials: 'include'
      });
      if (res.ok) {
        const result = await res.json();
        setSelectedUnitIds((result.data || []).map(p => p.id));
      }
    } catch { setSelectedUnitIds([]); }
  };

  const handleAssignUnits = async () => {
    setAssignLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.ROOT}/api/promo-codes/${assignModal.promoId}/properties`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ propertyIds: selectedUnitIds })
      });
      if (res.ok) {
        setAssignModal(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to assign units');
      }
    } catch { alert('Failed to assign units'); }
    finally { setAssignLoading(false); }
  };

  const toggleUnit = (id) => {
    setSelectedUnitIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_CONFIG.ROOT}/api/promo-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({
          code: newPromo.code,
          type: newPromo.type,
          value: parseFloat(newPromo.value),
          description: newPromo.description,
          startDate: newPromo.startDate,
          endDate: newPromo.endDate,
          usageLimit: parseInt(newPromo.usageLimit, 10),
          minBookingAmount: newPromo.minBookingAmount ? parseFloat(newPromo.minBookingAmount) : null
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newCode = result.data || result;
        setPromoCodes([...promoCodes, newCode]);
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
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create promo code');
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      alert('Failed to create promo code');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      const response = await fetch(`${API_CONFIG.ROOT}/api/promo-codes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        setPromoCodes(promoCodes.filter(p => p.id !== id));
      } else {
        alert('Failed to delete promo code');
      }
    } catch (error) {
      console.error('Error deleting promo code:', error);
      alert('Failed to delete promo code');
    }
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
                          <p className="font-semibold text-gray-900">{promo.usedCount || 0} / {promo.usageLimit}</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${((promo.usedCount || 0) / promo.usageLimit) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{new Date(promo.endDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promo.status)}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openAssignModal(promo)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="Assign Units"
                          >
                            <BuildingOfficeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePromo(promo.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
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

        {/* Assign Units Modal */}
        {assignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Units</h3>
                  <p className="text-sm text-gray-500">Promo: <span className="font-medium">{assignModal.promoCode}</span></p>
                </div>
                <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Select which units this promo code applies to. Leave all unchecked to apply to all units.
              </p>

              <div className="overflow-y-auto flex-1 space-y-2 mb-4">
                {hostUnits.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No units found.</p>
                ) : hostUnits.map(unit => (
                  <label key={unit.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUnitIds.includes(unit.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedUnitIds.includes(unit.id)}
                      onChange={() => toggleUnit(unit.id)}
                      className="text-green-600 focus:ring-green-500 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">{unit.title}</span>
                  </label>
                ))}
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={handleAssignUnits}
                  disabled={assignLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                >
                  {assignLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setAssignModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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