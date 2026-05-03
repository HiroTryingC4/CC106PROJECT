import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  ArrowLeftIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const HostVerification = () => {
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();
  const [selectedHost, setSelectedHost] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState({ show: false, message: '', type: 'success' });
  const [rejectModal, setRejectModal] = useState({ show: false, verificationId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const normalizeVerification = (request) => {
    const rawDetails = request?.details || {};
    const files = rawDetails?.files || {};
    const firstName = rawDetails?.firstName || '';
    const lastName = rawDetails?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    const normalizedDetails = {
      ...rawDetails,
      files,
      idPhoto: rawDetails?.idPhoto || files?.idDocumentPhoto?.fileUrl || '',
      ownerIdPhoto: rawDetails?.ownerIdPhoto || files?.ownerHoldingIdPhoto?.fileUrl || '',
      proofOfOwnership: rawDetails?.proofOfOwnership || files?.proofOfOwnership?.originalName || '',
      additionalDocs: rawDetails?.additionalDocs || files?.additionalDocuments?.originalName || ''
    };

    return {
      ...request,
      details: normalizedDetails,
      displayName: fullName || request.hostName || `Host ${request.hostId}`,
      displayEmail: normalizedDetails?.email || request.email || `host${request.hostId}@smartstay.com`,
      displayBusinessName: request.businessName || normalizedDetails?.company || 'N/A'
    };
  };

  // Fetch verification requests from API
  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');

        const headers = {};
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/host-verifications`, {
          method: 'GET',
          credentials: 'include',
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationRequests((data.data || []).map(normalizeVerification));
        } else {
          setError('Failed to fetch verifications');
        }
      } catch (err) {
        console.error('Error fetching verifications:', err);
        setError('Error loading verifications');
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) {
      return;
    }

    fetchVerifications();
  }, [authLoading, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckIcon className="w-4 h-4 mr-1" />;
      case 'pending': return <ClockIcon className="w-4 h-4 mr-1" />;
      case 'rejected': return <ExclamationTriangleIcon className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const handleViewDetails = (host) => {
    setSelectedHost(host);
    setShowDetailsModal(true);
  };

  const handleApprove = async (verificationId) => {
    try {
      const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/host-verifications/${verificationId}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        // Update the verification in the list
        setVerificationRequests(verificationRequests.map(v => 
          v.id === verificationId ? normalizeVerification({ ...v, status: 'approved' }) : v
        ));
        setShowDetailsModal(false);
        setSuccessModal({ show: true, message: 'Host verification approved successfully!', type: 'success' });
      } else {
        setSuccessModal({ show: true, message: 'Failed to approve verification', type: 'error' });
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      setSuccessModal({ show: true, message: 'Error approving verification', type: 'error' });
    }
  };

  const handleReject = async (verificationId) => {
    setRejectModal({ show: true, verificationId });
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setSuccessModal({ show: true, message: 'Please enter a rejection reason', type: 'error' });
      return;
    }

    try {
      const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/host-verifications/${rejectModal.verificationId}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the verification in the list
        setVerificationRequests(verificationRequests.map(v => 
          v.id === rejectModal.verificationId ? normalizeVerification({ ...v, status: 'rejected' }) : v
        ));
        setShowDetailsModal(false);
        setRejectModal({ show: false, verificationId: null });
        setRejectionReason('');
        setSuccessModal({ show: true, message: 'Host verification rejected successfully!', type: 'success' });
      } else {
        setSuccessModal({ show: true, message: 'Failed to reject verification', type: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      setSuccessModal({ show: true, message: 'Error rejecting verification', type: 'error' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to User Management
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900">Host Verifications</h1>
          <p className="text-gray-600 mt-2">Review and approve host verification requests</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && verificationRequests.length === 0 && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No verification requests found</p>
          </div>
        )}

        {/* Verification Requests Table */}
        {!loading && !error && verificationRequests.length > 0 && (
        <>
          {/* Mobile Card View */}
          <div className="space-y-4 sm:hidden">
            {verificationRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                      <span className="text-white text-lg font-bold">
                        {request.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{request.displayName}</h3>
                      <p className="text-sm text-gray-600 truncate">{request.displayEmail}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">ID</p>
                    <p className="font-medium text-gray-900">#{request.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Business</p>
                    <p className="font-medium text-gray-900 truncate">{request.displayBusinessName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">{request.submitted}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(request)}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verificationRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.displayName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.displayEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.displayBusinessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.submitted}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* Enhanced Verification Details Modal */}
        {showDetailsModal && selectedHost && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <div className="flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[95vh] sm:rounded-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-5 text-white sm:px-8 sm:py-6">
                <div className="flex items-start justify-between gap-3 sm:items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold sm:text-2xl">Verification Details</h3>
                      <p className="text-sm text-blue-100">Review host verification information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 transition-colors hover:bg-white/30"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 p-4 sm:space-y-8 sm:p-8">
                  {/* Host Information Card */}
                  <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
                        <span className="text-white text-xl font-bold">
                          {selectedHost.hostName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xl font-bold text-gray-900 sm:text-2xl">{selectedHost.hostName}</h4>
                        <p className="mt-1 flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {selectedHost.email}
                        </p>
                        <p className="mt-1 flex items-center text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 13a2 2 0 002 2h6a2 2 0 002-2L16 7" />
                          </svg>
                          Submitted: {selectedHost.submitted}
                        </p>
                      </div>
                      <div className="sm:ml-auto">
                        <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(selectedHost.status)}`}>
                          {getStatusIcon(selectedHost.status)}
                          {selectedHost.status === 'pending' ? 'Pending Review' : selectedHost.status.charAt(0).toUpperCase() + selectedHost.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Information Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="mb-6 flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Business Information</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Business Name</label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{selectedHost.businessName}</p>
                        </div>
                        {selectedHost.details && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Business Type</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{selectedHost.details.businessType}</p>
                          </div>
                        )}
                      </div>
                      {selectedHost.details && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Business Address</label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{selectedHost.details.businessAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Identification Card */}
                  {selectedHost.details && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="mb-6 flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Identification Details</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">ID Type</label>
                          <p className="text-lg font-semibold text-gray-900 mt-2">{selectedHost.details.idType}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">ID Number</label>
                          <p className="text-lg font-semibold text-gray-900 mt-2 font-mono">{selectedHost.details.idNumber}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tax ID</label>
                          <p className="text-lg font-semibold text-gray-900 mt-2 font-mono">{selectedHost.details.taxId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Photo Verification Card */}
                  {selectedHost.details && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-6 flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">ID Photo Verification</h4>
                          <p className="text-gray-600 text-sm">Verify identity documents and photo authenticity</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-bold">1</span>
                            </div>
                            <label className="text-lg font-semibold text-gray-900">ID Document Photo</label>
                          </div>
                          <div className="relative group">
                            <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
                              <img 
                                src={selectedHost.details.files?.idDocumentPhoto?.fileUrl || selectedHost.details.idPhoto} 
                                alt="ID Document" 
                                className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="hidden w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300">
                                <div className="text-center text-blue-600">
                                  <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="font-semibold">ID Document Photo</p>
                                  <p className="text-sm text-blue-500">Image not available</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 text-sm font-bold">2</span>
                            </div>
                            <label className="text-lg font-semibold text-gray-900">Owner Holding ID Photo</label>
                          </div>
                          <div className="relative group">
                            <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
                              <img 
                                src={selectedHost.details.files?.ownerHoldingIdPhoto?.fileUrl || selectedHost.details.ownerIdPhoto} 
                                alt="Owner Holding ID" 
                                className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                              />
                              <div className="hidden w-full h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center border-2 border-dashed border-green-300">
                                <div className="text-center text-green-600">
                                  <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <p className="font-semibold">Owner Holding ID Photo</p>
                                  <p className="text-sm text-green-500">Image not available</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900 mb-2">Verification Checklist:</p>
                            <ul className="text-blue-800 text-sm space-y-1">
                              <li>• Verify ID document is clear, readable, and not tampered with</li>
                              <li>• Confirm person in photo 2 is clearly holding the same ID document</li>
                              <li>• Check that personal information matches across both photos</li>
                              <li>• Ensure photos are recent and of good quality</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Documents Card */}
                  {selectedHost.details && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-6 flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Property Documents</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Proof of Ownership</label>
                          <div className="text-gray-900 mt-2 bg-white p-3 rounded-lg border text-sm">
                            {selectedHost.details.files?.proofOfOwnership?.fileUrl ? (
                              <a
                                href={selectedHost.details.files.proofOfOwnership.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {selectedHost.details.files.proofOfOwnership.originalName || 'Open proof of ownership'}
                              </a>
                            ) : (
                              <span className="font-mono">{selectedHost.details.proofOfOwnership || 'No file uploaded'}</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Additional Documents</label>
                          <div className="text-gray-900 mt-2 bg-white p-3 rounded-lg border text-sm">
                            {selectedHost.details.files?.additionalDocuments?.fileUrl ? (
                              <a
                                href={selectedHost.details.files.additionalDocuments.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {selectedHost.details.files.additionalDocuments.originalName || 'Open additional document'}
                              </a>
                            ) : (
                              <span>{selectedHost.details.additionalDocs || 'No additional document uploaded'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Modal Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-8 sm:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">Verification Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedHost.status)}`}>
                      {getStatusIcon(selectedHost.status)}
                      {selectedHost.status === 'pending' ? 'Pending Verification' : selectedHost.status.charAt(0).toUpperCase() + selectedHost.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedHost.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl bg-green-600 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-green-700 hover:shadow-xl sm:w-auto"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>Verify Host</span>
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedHost.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex w-full items-center justify-center space-x-2 rounded-xl bg-red-600 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-red-700 hover:shadow-xl sm:w-auto"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      <span>Deactivate User</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Modal */}
        {successModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all">
              {/* Icon Section */}
              <div className={`py-8 px-6 flex justify-center ${successModal.type === 'success' ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
                {successModal.type === 'success' ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
                    <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="px-6 py-8 text-center">
                <h3 className={`text-2xl font-bold mb-2 ${successModal.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                  {successModal.type === 'success' ? 'Success!' : 'Error'}
                </h3>
                <p className={`text-lg mb-6 ${successModal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {successModal.message}
                </p>
              </div>

              {/* Button Section */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setSuccessModal({ show: false, message: '', type: 'success' })}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    successModal.type === 'success'
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <CheckIcon className="w-5 h-5" />
                  <span>OK</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Reject Verification</h3>
                  <p className="text-red-100 text-sm">Please provide a reason for rejection</p>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this verification is being rejected..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                    rows="4"
                  />
                  <p className="text-xs text-gray-500 mt-2">{rejectionReason.length}/500 characters</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setRejectModal({ show: false, verificationId: null });
                    setRejectionReason('');
                  }}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HostVerification;