import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hosts');

  // Host data
  const hostStats = [
    { name: 'Total Hosts', value: '15', subtitle: '4 active', icon: UsersIcon, iconBg: 'bg-gray-600' },
    { name: 'Total Units', value: '21', subtitle: 'Across all hosts', icon: BuildingOfficeIcon, iconBg: 'bg-purple-600' },
    { name: 'Total Revenue', value: '$180.3K', subtitle: 'This month', icon: CurrencyDollarIcon, iconBg: 'bg-orange-500' },
  ];

  const hosts = [
    { id: 'H001', name: 'Sarah Johnson', email: 'sara.j@gmail.com', units: 5, revenue: 45250, joinDate: '1/1/2024', status: 'active' },
    { id: 'H002', name: 'Michael Chen', email: 'michael.chen@gmail.com', units: 3, revenue: 32250, joinDate: '3/22/2024', status: 'active' },
    { id: 'H003', name: 'Emma Davis', email: 'emma.davis@gmail.com', units: 7, revenue: 58250, joinDate: '11/8/2023', status: 'active' },
    { id: 'H004', name: 'James Wilson', email: 'james.w@gmail.com', units: 4, revenue: 29250, joinDate: '1/10/2025', status: 'active' },
    { id: 'H005', name: 'Linda Martinez', email: 'linda.m@gmail.com', units: 2, revenue: 15250, joinDate: '6/10/2024', status: 'inactive' },
  ];

  // Guest data
  const guestStats = [
    { name: 'Total Guests', value: '67', subtitle: '4 active', icon: UserGroupIcon, iconBg: 'bg-blue-500' },
    { name: 'Total Bookings', value: '31', subtitle: 'All time', icon: BuildingOfficeIcon, iconBg: 'bg-purple-600' },
    { name: 'Avg Bookings', value: '7.8', subtitle: 'per Guest', icon: CurrencyDollarIcon, iconBg: 'bg-orange-500' },
  ];

  const guests = [
    { id: 'G001', name: 'Robert Brown', email: 'robert.b@gmail.com', bookings: 8, joinDate: '9/1/2024', status: 'active' },
    { id: 'G002', name: 'Jennifer Lee', email: 'jennifer.lee@gmail.com', bookings: 3, joinDate: '3/22/2024', status: 'active' },
    { id: 'G003', name: 'David Kim', email: 'david.kim@gmail.com', bookings: 15, joinDate: '1/18/2023', status: 'active' },
    { id: 'G004', name: 'Maria Garcia', email: 'maria.g@gmail.com', bookings: 5, joinDate: '9/10/2025', status: 'active' },
  ];

  // Disputes data
  const disputeStats = [
    { name: 'Total Disputes', value: '3', subtitle: '', icon: ExclamationTriangleIcon, iconBg: 'bg-red-500' },
    { name: 'Open', value: '1', subtitle: '', icon: ClockIcon, iconBg: 'bg-gray-600' },
    { name: 'Investigating', value: '1', subtitle: '', icon: ExclamationTriangleIcon, iconBg: 'bg-purple-600' },
    { name: 'Resolved', value: '1', subtitle: '', icon: CheckCircleIcon, iconBg: 'bg-green-500' },
  ];

  const disputes = [
    { 
      id: 'D001', 
      bookingId: 'B003', 
      guest: 'David Kim', 
      host: 'Michael Chen', 
      issue: 'Property not as described - missing amenities', 
      priority: 'high', 
      createdDate: '1/1/2024', 
      status: 'investigating' 
    },
    { 
      id: 'D002', 
      bookingId: 'B002', 
      guest: 'Jennifer Lee', 
      host: 'Sarah Johnson', 
      issue: 'Noise complained by neighbors', 
      priority: 'medium', 
      createdDate: '3/22/2024', 
      status: 'resolved' 
    },
    { 
      id: 'D003', 
      bookingId: 'B001', 
      guest: 'Robert Brown', 
      host: 'Sarah Johnson', 
      issue: 'Refund request for early checkout', 
      priority: 'low', 
      createdDate: '11/8/2023', 
      status: 'pending' 
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisputeStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <button 
            onClick={() => navigate('/admin/host-verification')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            View Hosts Verification
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('hosts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hosts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Host (15)
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Guests (67)
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'disputes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Disputes (0)
            </button>
          </nav>
        </div>

        {/* Host Tab Content */}
        {activeTab === 'hosts' && (
          <div className="space-y-6">
            {/* Host Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hostStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.subtitle}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Host Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HOST ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UNITS</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REVENUE</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JOINED DATE</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hosts.map((host) => (
                      <tr key={host.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{host.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{host.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          <span className="mr-2">✉️</span>
                          {host.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{host.units}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          $ {host.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {host.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(host.status)}`}>
                            {host.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Guests Tab Content */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Guest Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guestStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.subtitle}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Guest Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GUEST ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOOKINGS</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JOINED DATE</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guest.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          <span className="mr-2">✉️</span>
                          {guest.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.bookings}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {guest.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(guest.status)}`}>
                            {guest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Disputes Tab Content */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            {/* Dispute Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {disputeStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.subtitle}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disputes Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DISPUTE ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOOKING ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GUEST</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HOST</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISSUE</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRIORITY</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED DATE</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {disputes.map((dispute) => (
                      <tr key={dispute.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dispute.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dispute.bookingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dispute.guest}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dispute.host}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{dispute.issue}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {dispute.createdDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getDisputeStatusColor(dispute.status)}`}>
                            {dispute.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;