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
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
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
        )}

        {/* Verification Details Modal */}
        {showDetailsModal && selectedHost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Verification Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Host Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Host Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Name:</label>
                      <p className="font-medium text-gray-900">{selectedHost.displayName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email:</label>
                      <p className="font-medium text-gray-900">{selectedHost.displayEmail}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600">Submitted:</label>
                      <p className="font-medium text-gray-900">{selectedHost.submitted}</p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Business Name:</label>
                      <p className="font-medium text-gray-900">{selectedHost.displayBusinessName}</p>
                    </div>
                    {selectedHost.details && (
                      <>
                        <div>
                          <label className="text-sm text-gray-600">Address:</label>
                          <p className="font-medium text-gray-900">{selectedHost.details.businessAddress}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Type:</label>
                          <p className="font-medium text-gray-900">{selectedHost.details.businessType}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Identification */}
                {selectedHost.details && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Identification</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">ID Type:</label>
                        <p className="font-medium text-gray-900">{selectedHost.details.idType}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">ID Number:</label>
                        <p className="font-medium text-gray-900">{selectedHost.details.idNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600">Tax ID:</label>
                        <p className="font-medium text-gray-900">{selectedHost.details.taxId}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ID Photo Verification */}
                {selectedHost.details && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">ID Photo Verification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">ID Document Photo:</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                          <img 
                            src={selectedHost.details.files?.idDocumentPhoto?.fileUrl || selectedHost.details.idPhoto} 
                            alt="ID Document" 
                            className="w-full h-40 object-cover rounded-lg bg-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm">ID Document Photo</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Owner Holding ID Photo:</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                          <img 
                            src={selectedHost.details.files?.ownerHoldingIdPhoto?.fileUrl || selectedHost.details.ownerIdPhoto} 
                            alt="Owner Holding ID" 
                            className="w-full h-40 object-cover rounded-lg bg-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <p className="text-sm">Owner Holding ID Photo</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium text-blue-900 mb-1">Verification Instructions:</p>
                      <p className="text-blue-800">
                        Please verify that the ID document is clear and readable, and that the person in the second photo 
                        is clearly holding the same ID document. Check that the information matches across both photos.
                      </p>
                    </div>
                  </div>
                )}

                {/* Property Documents */}
                {selectedHost.details && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Property Documents</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Proof of Ownership:</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
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
                            <span>{selectedHost.details.proofOfOwnership || 'No file uploaded'}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Additional Documents:</label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
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

                {/* Verification Status */}
                <div>
                  <label className="text-sm text-gray-600">Verification Status:</label>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedHost.status)}`}>
                      {getStatusIcon(selectedHost.status)}
                      {selectedHost.status === 'pending' ? 'Pending Verification' : selectedHost.status.charAt(0).toUpperCase() + selectedHost.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Edit User
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedHost.id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Verify Host
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedHost.id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Deactivate User
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Verification Details Modal */}
        {showDetailsModal && selectedHost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Verification Details</h3>
                      <p className="text-blue-100 text-sm">Review host verification information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
                <div className="p-8 space-y-8">
                  {/* Host Information Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {selectedHost.hostName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-900">{selectedHost.hostName}</h4>
                        <p className="text-gray-600 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {selectedHost.email}
                        </p>
                        <p className="text-gray-500 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 13a2 2 0 002 2h6a2 2 0 002-2L16 7" />
                          </svg>
                          Submitted: {selectedHost.submitted}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedHost.status)}`}>
                          {getStatusIcon(selectedHost.status)}
                          {selectedHost.status === 'pending' ? 'Pending Review' : selectedHost.status.charAt(0).toUpperCase() + selectedHost.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Information Card */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Business Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Identification Details</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
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
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      
                      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
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
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
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
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">Verification Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedHost.status)}`}>
                      {getStatusIcon(selectedHost.status)}
                      {selectedHost.status === 'pending' ? 'Pending Verification' : selectedHost.status.charAt(0).toUpperCase() + selectedHost.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedHost.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <CheckIcon className="w-5 h-5" />
                      <span>Verify Host</span>
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedHost.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
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