import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hosts');
  const [hosts, setHosts] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [token, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users?${params.toString()}`, {
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      const hostUsers = data.users.filter(u => u.role === 'host');
      const guestUsers = data.users.filter(u => u.role === 'guest');
      
      setHosts(hostUsers);
      setGuests(guestUsers);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const totalHosts = hosts.length;
  const totalGuests = guests.length;
  const totalUnits = hosts.reduce((sum, host) => sum + host.propertiesCount, 0);
  const totalRevenue = hosts.reduce((sum, host) => sum + host.totalRevenue, 0);
  const totalBookings = guests.reduce((sum, guest) => sum + guest.bookingsCount, 0);
  const avgBookings = totalGuests > 0 ? (totalBookings / totalGuests).toFixed(1) : 0;
  const hostStats = [
    { name: 'Total Hosts', value: totalHosts.toString(), subtitle: `${hosts.filter(h => h.status === 'active').length} active`, icon: UsersIcon, iconBg: 'bg-gray-600' },
    { name: 'Total Units', value: totalUnits.toString(), subtitle: 'Across all hosts', icon: BuildingOfficeIcon, iconBg: 'bg-purple-600' },
    { name: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, subtitle: 'All time', icon: CurrencyDollarIcon, iconBg: 'bg-orange-500' },
  ];

  // Guest data
  const guestStats = [
    { name: 'Total Guests', value: totalGuests.toString(), subtitle: `${guests.filter(g => g.status === 'active').length} active`, icon: UserGroupIcon, iconBg: 'bg-blue-500' },
    { name: 'Total Bookings', value: totalBookings.toString(), subtitle: 'All time', icon: BuildingOfficeIcon, iconBg: 'bg-purple-600' },
    { name: 'Avg Bookings', value: avgBookings.toString(), subtitle: 'per Guest', icon: CurrencyDollarIcon, iconBg: 'bg-orange-500' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
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

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const paginatedHosts = paginateData(hosts);
  const paginatedGuests = paginateData(guests);

  const handleViewDetails = (user) => {
    setDetailsUser(user);
    setShowDetailsModal(true);
  };

  const handleStatusChange = (user, status) => {
    setSelectedUser(user);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedUser || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${selectedUser.id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Refresh users list
      await fetchUsers();
      setShowStatusModal(false);
      setSelectedUser(null);
      setNewStatus('');
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusWarning = (status) => {
    switch (status) {
      case 'inactive':
        return {
          title: 'Set User as Inactive',
          message: 'This user will be temporarily disabled and cannot access their account. They can be reactivated later.',
          icon: '⚠️',
          color: 'yellow'
        };
      case 'suspended':
        return {
          title: 'Suspend User Account',
          message: 'This user will be suspended and all their activities will be blocked. This is a serious action that should be used for policy violations.',
          icon: '🚫',
          color: 'red'
        };
      case 'maintenance':
        return {
          title: 'Set Account to Maintenance',
          message: 'This account will be placed in maintenance mode. The user will have limited access while account maintenance is performed.',
          icon: '🔧',
          color: 'blue'
        };
      case 'active':
        return {
          title: 'Activate User Account',
          message: 'This user will be activated and can access their account normally.',
          icon: '✅',
          color: 'green'
        };
      default:
        return {
          title: 'Change User Status',
          message: 'Are you sure you want to change this user\'s status?',
          icon: '❓',
          color: 'gray'
        };
    }
  };

  return (
    <AdminLayout>
      {/* User Details Modal */}
      {showDetailsModal && detailsUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 rounded-t-[28px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                    {detailsUser.firstName?.[0]}{detailsUser.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {detailsUser.firstName} {detailsUser.lastName}
                    </h3>
                    <p className="text-green-100 text-sm capitalize">{detailsUser.role} Account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(detailsUser.status)}`}>
                  {detailsUser.status.toUpperCase()}
                </span>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl bg-green-50 p-5">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <IdentificationIcon className="w-5 h-5 text-green-600" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="text-sm font-medium text-gray-900">{detailsUser.email}</p>
                    </div>
                  </div>
                  {detailsUser.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900">{detailsUser.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Statistics */}
              <div className="rounded-2xl bg-green-50 p-5">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                  Account Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <p className="text-lg font-bold text-gray-900">#{detailsUser.id}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Join Date</p>
                    <p className="text-lg font-bold text-gray-900">{new Date(detailsUser.joinDate).toLocaleDateString()}</p>
                  </div>
                  {detailsUser.role === 'host' && (
                    <>
                      <div className="bg-white rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Total Units</p>
                        <p className="text-lg font-bold text-gray-900">{detailsUser.propertiesCount}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-lg font-bold text-green-600">₱{detailsUser.totalRevenue.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  {detailsUser.role === 'guest' && (
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                      <p className="text-lg font-bold text-gray-900">{detailsUser.bookingsCount}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="rounded-2xl bg-green-50 p-5">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                  Account Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-green-100">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{detailsUser.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-green-100">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-gray-900 capitalize">{detailsUser.status}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-green-100">
                    <span className="text-gray-600">Email Verified:</span>
                    <span className="font-medium text-green-600">✓ Verified</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium text-gray-900">{new Date(detailsUser.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-[28px] border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full rounded-2xl bg-green-600 px-4 py-3 font-medium text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-4xl ${
              getStatusWarning(newStatus).color === 'red' ? 'bg-red-100' :
              getStatusWarning(newStatus).color === 'yellow' ? 'bg-yellow-100' :
              getStatusWarning(newStatus).color === 'blue' ? 'bg-blue-100' :
              getStatusWarning(newStatus).color === 'green' ? 'bg-green-100' :
              'bg-gray-100'
            }`}>
              {getStatusWarning(newStatus).icon}
            </div>
            <h3 className="text-center text-xl font-semibold text-gray-900">
              {getStatusWarning(newStatus).title}
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-xs text-gray-600">{selectedUser.email}</p>
                <p className="mt-1 text-xs text-gray-500">Role: {selectedUser.role}</p>
              </div>
              <p className="text-center text-sm leading-6 text-gray-600">
                {getStatusWarning(newStatus).message}
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedUser(null);
                  setNewStatus('');
                }}
                disabled={updatingStatus}
                className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={updatingStatus}
                className={`flex-1 rounded-2xl px-4 py-3 font-medium text-white shadow-lg transition disabled:opacity-50 ${
                  getStatusWarning(newStatus).color === 'red' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' :
                  getStatusWarning(newStatus).color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20' :
                  getStatusWarning(newStatus).color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' :
                  getStatusWarning(newStatus).color === 'green' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' :
                  'bg-gray-600 hover:bg-gray-700 shadow-gray-600/20'
                }`}
              >
                {updatingStatus ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">User Management</h1>
            <p className="mt-2 text-gray-600">Manage all system users and disputes</p>
          </div>
          <button 
            onClick={() => navigate('/admin/host-verification')}
            className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 sm:w-auto"
          >
            View Hosts Verification
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex min-w-max space-x-8 pr-4 sm:pr-0">
            <button
              onClick={() => setActiveTab('hosts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hosts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Host ({totalHosts})
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Guests ({totalGuests})
            </button>
          </nav>
        </div>

        {/* Host Tab Content */}
        {activeTab === 'hosts' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="host">Host</option>
                  <option value="guest">Guest</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {loading ? (
              <LoadingSpinner text="Loading hosts..." />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Host Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
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
                <div className="space-y-3 sm:hidden">
                  {paginatedHosts.map((host) => (
                    <div key={host.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Host #{host.id}</p>
                          <h3 className="mt-1 text-lg font-semibold text-gray-900">{host.firstName} {host.lastName}</h3>
                          <p className="mt-1 flex items-center text-sm text-gray-600">
                            <span className="mr-2">✉️</span>
                            <span className="truncate">{host.email}</span>
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(host.status)}`}>
                          {host.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Units</p>
                          <p className="font-medium text-gray-900">{host.propertiesCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revenue</p>
                          <p className="font-medium text-green-600">₱ {host.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Joined</p>
                          <p className="font-medium text-gray-900">{new Date(host.joinDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Action</p>
                          <button 
                            onClick={() => handleViewDetails(host)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 sm:block">
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
                        {paginatedHosts.map((host) => (
                          <tr key={host.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{host.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{host.firstName} {host.lastName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                              <span className="mr-2">✉️</span>
                              {host.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{host.propertiesCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              ₱ {host.totalRevenue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {new Date(host.joinDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={host.status}
                                onChange={(e) => handleStatusChange(host, e.target.value)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusColor(host.status)}`}
                              >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                                <option value="suspended">suspended</option>
                                <option value="maintenance">maintenance</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button 
                                onClick={() => handleViewDetails(host)}
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
                  {/* Pagination */}
                  {totalPages(hosts) > 1 && (
                    <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages(hosts)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages(hosts), prev + 1))}
                        disabled={currentPage === totalPages(hosts)}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Guests Tab Content */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {loading ? (
              <LoadingSpinner text="Loading guests..." />
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Guest Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
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
                <div className="space-y-3 sm:hidden">
                  {paginatedGuests.map((guest) => (
                    <div key={guest.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Guest #{guest.id}</p>
                          <h3 className="mt-1 text-lg font-semibold text-gray-900">{guest.firstName} {guest.lastName}</h3>
                          <p className="mt-1 flex items-center text-sm text-gray-600">
                            <span className="mr-2">✉️</span>
                            <span className="truncate">{guest.email}</span>
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(guest.status)}`}>
                          {guest.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Bookings</p>
                          <p className="font-medium text-gray-900">{guest.bookingsCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Joined</p>
                          <p className="font-medium text-gray-900">{new Date(guest.joinDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Action</p>
                          <button 
                            onClick={() => handleViewDetails(guest)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 sm:block">
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
                        {paginatedGuests.map((guest) => (
                          <tr key={guest.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{guest.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.firstName} {guest.lastName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                              <span className="mr-2">✉️</span>
                              {guest.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{guest.bookingsCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {new Date(guest.joinDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={guest.status}
                                onChange={(e) => handleStatusChange(guest, e.target.value)}
                                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${getStatusColor(guest.status)}`}
                              >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                                <option value="suspended">suspended</option>
                                <option value="maintenance">maintenance</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button 
                                onClick={() => handleViewDetails(guest)}
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
                  {/* Pagination */}
                  {totalPages(guests) > 1 && (
                    <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages(guests)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages(guests), prev + 1))}
                        disabled={currentPage === totalPages(guests)}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
