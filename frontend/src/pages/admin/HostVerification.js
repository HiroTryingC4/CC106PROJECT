import React, { useState } from 'react';
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

const HostVerification = () => {
  const navigate = useNavigate();
  const [selectedHost, setSelectedHost] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const verificationRequests = [
    {
      id: '#1',
      hostName: 'Johyeon Jo',
      email: 'johyeon.jo@gmail.com',
      businessName: 'hummingbird int.',
      submitted: '2/21/2026',
      status: 'approved',
      details: {
        businessAddress: '123 Business St, Seoul, Korea 12345',
        businessType: 'Property Management',
        idType: 'Passport',
        idNumber: 'K87654321',
        taxId: '12-3456789',
        idPhoto: '/api/placeholder/400/250', // ID document photo
        ownerIdPhoto: '/api/placeholder/400/250', // Owner holding ID photo
        proofOfOwnership: 'Property deed and LLC registration - Document ID: DOC-2024-001',
        additionalDocs: 'Business license, Liability insurance, Property management certification'
      }
    },
    {
      id: '#2',
      hostName: 'Linda Walker',
      email: 'linda.walker@gmail.com',
      businessName: '719 Rentals',
      submitted: '2/15/2024',
      status: 'pending',
      details: {
        businessAddress: '789 Sunset Boulevard, Los Angeles, CA 90028',
        businessType: 'Rental Homes',
        idType: 'Passport',
        idNumber: 'PB7654321',
        taxId: '12-3456789',
        idPhoto: '/api/placeholder/400/250', // ID document photo
        ownerIdPhoto: '/api/placeholder/400/250', // Owner holding ID photo
        proofOfOwnership: 'Property deed and LLC registration - Document ID: DOC-2024-003',
        additionalDocs: 'Business license, Liability insurance, Property management certification'
      }
    },
    {
      id: '#3',
      hostName: 'Shelly Scott',
      email: 'shelly.scott@gmail.com',
      businessName: 'Block 14, Est',
      submitted: '2/21/2026',
      status: 'approved'
    },
    {
      id: '#4',
      hostName: 'undefined undefined',
      email: 'dwdwdw@gmail.com',
      businessName: 'ddddd',
      submitted: '2/21/2026',
      status: 'rejected'
    },
    {
      id: '#5',
      hostName: 'undefined undefined',
      email: 'dwdwdw@gmail.com',
      businessName: 'wdwdwf',
      submitted: '2/21/2026',
      status: 'rejected'
    },
    {
      id: '#6',
      hostName: 'Noah Austin',
      email: 'noah.austin@gmail.com',
      businessName: 'Austin Villa',
      submitted: '2/21/2026',
      status: 'approved'
    },
    {
      id: '#7',
      hostName: 'Owen Knight',
      email: 'owen.knight@gmail.com',
      businessName: 'Light Cavalry',
      submitted: '2/21/2026',
      status: 'pending'
    },
    {
      id: '#8',
      hostName: 'Dom Kang',
      email: 'dom.kang@gmail.com',
      businessName: '4458 bck.',
      submitted: '2/26/2026',
      status: 'approved'
    },
    {
      id: '#9',
      hostName: 'June Lee',
      email: 'june.lee@gmail.com',
      businessName: 'Sports Space',
      submitted: '3/9/2026',
      status: 'approved'
    },
    {
      id: '#10',
      hostName: 'Minu Yun',
      email: 'minu.yun@gmail.com',
      businessName: 'Yun Hotel',
      submitted: '3/10/2026',
      status: 'approved'
    },
  ];

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

  const handleApprove = (hostId) => {
    console.log('Approving host:', hostId);
    // Update status logic here
  };

  const handleReject = (hostId) => {
    console.log('Rejecting host:', hostId);
    // Update status logic here
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

        {/* Verification Requests Table */}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.hostName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.businessName}</td>
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
                      <p className="font-medium text-gray-900">{selectedHost.hostName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email:</label>
                      <p className="font-medium text-gray-900">{selectedHost.email}</p>
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
                      <p className="font-medium text-gray-900">{selectedHost.businessName}</p>
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
                            src={selectedHost.details.idPhoto} 
                            alt="ID Document" 
                            className="w-full h-40 object-cover rounded-lg bg-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
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
                            src={selectedHost.details.ownerIdPhoto} 
                            alt="Owner Holding ID" 
                            className="w-full h-40 object-cover rounded-lg bg-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
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
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedHost.details.proofOfOwnership}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Additional Documents:</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedHost.details.additionalDocs}</p>
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
                                src={selectedHost.details.idPhoto} 
                                alt="ID Document" 
                                className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
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
                                src={selectedHost.details.ownerIdPhoto} 
                                alt="Owner Holding ID" 
                                className="w-full h-48 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
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
                          <p className="text-gray-900 mt-2 bg-white p-3 rounded-lg border font-mono text-sm">{selectedHost.details.proofOfOwnership}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Additional Documents</label>
                          <p className="text-gray-900 mt-2 bg-white p-3 rounded-lg border">{selectedHost.details.additionalDocs}</p>
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
      </div>
    </AdminLayout>
  );
};

export default HostVerification;