import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  UserPlusIcon, 
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UsersIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const CommunicationAdminManagement = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states for adding new admin
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    adminNumber: ''
  });

  // Sample communication admins data
  const [commAdmins, setCommAdmins] = useState([
    {
      id: 1,
      firstName: 'Communication',
      lastName: 'Admin',
      email: 'comm-admin@smartstay.com',
      adminNumber: 'adm1',
      status: 'active',
      createdAt: '2024-03-10',
      lastLogin: '2024-03-15 14:30:25'
    },
    {
      id: 2,
      firstName: 'Communication',
      lastName: 'Admin 2',
      email: 'comm-admin2@smartstay.com',
      adminNumber: 'adm2',
      status: 'active',
      createdAt: '2024-03-12',
      lastLogin: '2024-03-15 10:15:10'
    }
  ]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Password to unlock the page
    if (password === 'superadmin123') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email || !newAdmin.password || !newAdmin.adminNumber) {
      alert('Please fill in all fields');
      return;
    }

    // Check if email already exists
    if (commAdmins.some(admin => admin.email === newAdmin.email)) {
      alert('Email already exists');
      return;
    }

    // Check if admin number already exists
    if (commAdmins.some(admin => admin.adminNumber === newAdmin.adminNumber)) {
      alert('Admin number already exists');
      return;
    }

    // Add new admin
    const newAdminData = {
      id: commAdmins.length + 1,
      ...newAdmin,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    setCommAdmins([...commAdmins, newAdminData]);
    
    // Reset form
    setNewAdmin({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      adminNumber: ''
    });
    setShowAddForm(false);
    
    alert(`Communication Admin "${newAdmin.adminNumber}" created successfully!`);
  };

  const handleDeleteAdmin = (adminId) => {
    const admin = commAdmins.find(a => a.id === adminId);
    if (window.confirm(`Are you sure you want to delete ${admin.adminNumber}?`)) {
      setCommAdmins(commAdmins.filter(a => a.id !== adminId));
      alert(`${admin.adminNumber} deleted successfully`);
    }
  };

  const handleToggleStatus = (adminId) => {
    setCommAdmins(commAdmins.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
        : admin
    ));
  };

  // Password protection screen
  if (!isUnlocked) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <LockClosedIcon className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Restricted Access
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Communication Admin Management
              </p>
              <p className="mt-1 text-xs text-red-600">
                This page requires special authorization
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="password" className="sr-only">
                  Access Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                    placeholder="Enter access password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Unlock Access
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Contact system administrator for access
                </p>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Main management interface (unlocked)
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="w-8 h-8 mr-3 text-green-600" />
              Communication Admin Management
            </h2>
            <p className="text-gray-600 mt-2">Manage communication administrators and their access</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Add New Admin</span>
            </button>
            <button
              onClick={() => {
                setIsUnlocked(false);
                setPassword('');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <LockClosedIcon className="w-5 h-5" />
              <span>Lock Page</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Comm Admins</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{commAdmins.length}</p>
            <p className="text-sm text-green-600 mt-1">Active accounts</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Admins</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {commAdmins.filter(a => a.status === 'active').length}
            </p>
            <p className="text-sm text-green-600 mt-1">Currently active</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Inactive Admins</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {commAdmins.filter(a => a.status === 'inactive').length}
            </p>
            <p className="text-sm text-red-600 mt-1">Disabled accounts</p>
          </div>
        </div>

        {/* Communication Admins List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Communication Administrators</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {admin.firstName[0]}{admin.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {admin.adminNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(admin.id)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            admin.status === 'active'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {admin.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Admin Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Communication Admin</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={newAdmin.firstName}
                      onChange={(e) => setNewAdmin({...newAdmin, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={newAdmin.lastName}
                      onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john.doe@smartstay.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Number</label>
                  <input
                    type="text"
                    value={newAdmin.adminNumber}
                    onChange={(e) => setNewAdmin({...newAdmin, adminNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="adm3"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be used for message labeling (e.g., adm3, adm4)</p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Create Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CommunicationAdminManagement;