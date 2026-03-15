import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  StarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminUnits = () => {
  const [activeTab, setActiveTab] = useState('approved');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const units = [
    {
      id: '#1',
      name: 'Luxury Beachfront Condo',
      host: 'John Smith',
      type: 'Condo',
      price: '₱150',
      rating: 4.5,
      reviews: 45,
      moderation: 'approved',
      status: 'Available'
    },
    {
      id: '#2',
      name: 'Modern Downtown Studio',
      host: 'John Smith',
      type: 'Studio',
      price: '₱85',
      rating: 4.2,
      reviews: 28,
      moderation: 'pending',
      status: 'Available'
    },
    {
      id: '#3',
      name: 'Family-Friendly Villa',
      host: 'John Smith',
      type: 'Villa',
      price: '₱220',
      rating: 4.6,
      reviews: 62,
      moderation: 'approved',
      status: 'Available'
    },
    {
      id: '#4',
      name: 'Cozy Mountain Cabin',
      host: 'John Smith',
      type: 'Cabin',
      price: '₱120',
      rating: 4.7,
      reviews: 34,
      moderation: 'approved',
      status: 'Available'
    },
    {
      id: '#5',
      name: 'Urban Loft Apartment',
      host: 'John Smith',
      type: 'Apartment',
      price: '₱95',
      rating: 4.4,
      reviews: 41,
      moderation: 'approved',
      status: 'Available'
    },
    {
      id: '#6',
      name: 'Lakeside Retreat',
      host: 'John Smith',
      type: 'House',
      price: '₱280',
      rating: 4.9,
      reviews: 78,
      moderation: 'pending',
      status: 'Available'
    },
    {
      id: '#7',
      name: 'City Center Penthouse',
      host: 'John Smith',
      type: 'Penthouse',
      price: '₱350',
      rating: 4.8,
      reviews: 56,
      moderation: 'rejected',
      status: 'Available'
    },
    {
      id: '#8',
      name: 'Countryside Cottage',
      host: 'John Smith',
      type: 'Cottage',
      price: '₱110',
      rating: 4.7,
      reviews: 39,
      moderation: 'approved',
      status: 'Available'
    },
    {
      id: '#9',
      name: 'TRIAL@gmail.com',
      host: 'TRIALS TRIALS',
      type: 'Apartment',
      price: '₱21321',
      rating: 0,
      reviews: 0,
      moderation: 'approved',
      status: 'Available'
    },
    {
      id: '#10',
      name: 'Barela',
      host: 'TRIALS TRIALS',
      type: 'Apartment',
      price: '₱150',
      rating: 0,
      reviews: 0,
      moderation: 'pending',
      status: 'Available'
    },
    {
      id: '#11',
      name: 'Seaside Resort',
      host: 'Maria Garcia',
      type: 'Resort',
      price: '₱450',
      rating: 4.3,
      reviews: 89,
      moderation: 'rejected',
      status: 'Available'
    },
    {
      id: '#12',
      name: 'Mountain View Lodge',
      host: 'David Kim',
      type: 'Lodge',
      price: '₱200',
      rating: 4.1,
      reviews: 23,
      moderation: 'rejected',
      status: 'Available'
    },
  ];

  // Filter units by moderation status
  const getFilteredUnits = (status) => {
    return units.filter(unit => unit.moderation === status);
  };

  const approvedUnits = getFilteredUnits('approved');
  const pendingUnits = getFilteredUnits('pending');
  const rejectedUnits = getFilteredUnits('rejected');

  const getModerationColor = (moderation) => {
    switch (moderation) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModerationIcon = (moderation) => {
    switch (moderation) {
      case 'approved': return <CheckIcon className="w-4 h-4 mr-1" />;
      case 'pending': return <ClockIcon className="w-4 h-4 mr-1" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  const getActionButtons = (moderation) => {
    if (moderation === 'pending') {
      return (
        <div className="flex space-x-2">
          <button className="text-green-600 hover:text-green-800 text-sm font-medium">Approve</button>
          <button className="text-red-600 hover:text-red-800 text-sm font-medium">Reject</button>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
          <button className="text-orange-500 hover:text-orange-700 text-sm font-medium">Flag</button>
          <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </div>
      );
    } else {
      return (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
          <button className="text-orange-500 hover:text-orange-700 text-sm font-medium">Flag</button>
          <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
        </div>
      );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all system users and disputes</p>
          </div>
          <div className="flex space-x-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Listings</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved ({approvedUnits.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingUnits.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected ({rejectedUnits.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moderation</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(activeTab === 'approved' ? approvedUnits : 
                  activeTab === 'pending' ? pendingUnits : rejectedUnits).map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.host}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unit.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-1">{unit.rating}</span>
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-gray-500">({unit.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getModerationColor(unit.moderation)}`}>
                        {getModerationIcon(unit.moderation)}
                        {unit.moderation.charAt(0).toUpperCase() + unit.moderation.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>{unit.status}</option>
                        <option>Unavailable</option>
                        <option>Maintenance</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getActionButtons(unit.moderation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {(activeTab === 'approved' ? approvedUnits : 
          activeTab === 'pending' ? pendingUnits : rejectedUnits).length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} units found</h3>
            <p className="text-gray-600">There are currently no units in the {activeTab} status.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUnits;