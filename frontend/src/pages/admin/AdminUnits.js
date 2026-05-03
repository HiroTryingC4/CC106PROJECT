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
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">User Management</h1>
            <p className="mt-2 text-gray-600">Manage all system users and disputes</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-auto sm:py-2">
              <option>All Listings</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex min-w-max space-x-8 pr-4 sm:pr-0">
            <button
              onClick={() => setActiveTab('approved')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved ({approvedUnits.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingUnits.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
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
        <div className="space-y-3 sm:hidden">
          {(activeTab === 'approved' ? approvedUnits : 
            activeTab === 'pending' ? pendingUnits : rejectedUnits).map((unit) => (
            <div key={unit.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Unit #{unit.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">{unit.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">Host: {unit.host}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getModerationColor(unit.moderation)}`}>
                  {getModerationIcon(unit.moderation)}
                  {unit.moderation.charAt(0).toUpperCase() + unit.moderation.slice(1)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900">{unit.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price/Night</p>
                  <p className="font-medium text-gray-900">{unit.price}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rating</p>
                  <div className="flex items-center font-medium text-gray-900">
                    <span className="mr-1">{unit.rating}</span>
                    <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="ml-1 text-gray-500">({unit.reviews})</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <select className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500">
                    <option>{unit.status}</option>
                    <option>Unavailable</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {getActionButtons(unit.moderation)}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 sm:block">
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