import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  LockClosedIcon,
  KeyIcon,
  ComputerDesktopIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Security = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const accessLogs = [
    {
      id: 1,
      time: '2024-03-15 14:30:25',
      email: 'admin@smartstay.com',
      action: 'Login Success',
      ipAddress: '192.168.1.100',
      location: 'Manila, Philippines'
    },
    {
      id: 2,
      time: '2024-03-15 14:25:12',
      email: 'john.doe@example.com',
      action: 'Login Failed',
      ipAddress: '198.51.100.42',
      location: 'Unknown'
    },
    {
      id: 3,
      time: '2024-03-15 14:20:33',
      email: 'host@smartstay.com',
      action: 'Login Success',
      ipAddress: '203.0.113.15',
      location: 'Cebu, Philippines'
    },
    {
      id: 4,
      time: '2024-03-15 14:15:45',
      email: 'guest.trial@smartstay.com',
      action: 'Login Success',
      ipAddress: '192.0.2.88',
      location: 'Davao, Philippines'
    },
    {
      id: 5,
      time: '2024-03-15 14:10:22',
      email: 'hacker@malicious.com',
      action: 'Login Failed',
      ipAddress: '198.51.100.42',
      location: 'Unknown'
    },
    {
      id: 6,
      time: '2024-03-15 14:05:11',
      email: 'admin@smartstay.com',
      action: 'Password Change',
      ipAddress: '192.168.1.100',
      location: 'Manila, Philippines'
    }
  ];

  const incidents = [
    {
      id: 1,
      type: 'Brute Force Attack',
      severity: 'High',
      description: 'Multiple failed login attempts detected from IP 198.51.100.42',
      timestamp: '2024-03-15 14:25:12',
      status: 'Active',
      affectedUsers: 3
    },
    {
      id: 2,
      type: 'Suspicious Activity',
      severity: 'Medium',
      description: 'Unusual booking pattern detected for multiple accounts',
      timestamp: '2024-03-15 13:45:30',
      status: 'Investigating',
      affectedUsers: 7
    },
    {
      id: 3,
      type: 'Data Breach Attempt',
      severity: 'Critical',
      description: 'SQL injection attempt blocked on booking form',
      timestamp: '2024-03-15 12:20:15',
      status: 'Resolved',
      affectedUsers: 0
    }
  ];

  const blockedIPs = [
    { 
      ip: '198.51.100.42', 
      reason: 'Brute force attack', 
      blockedAt: '2024-03-15 14:30:25', 
      attempts: 127,
      location: 'Unknown',
      status: 'Active'
    },
    { 
      ip: '203.0.113.15', 
      reason: 'Suspicious activity', 
      blockedAt: '2024-03-15 13:15:10', 
      attempts: 45,
      location: 'Russia',
      status: 'Active'
    },
    { 
      ip: '192.0.2.88', 
      reason: 'Malware detected', 
      blockedAt: '2024-03-15 11:22:45', 
      attempts: 23,
      location: 'China',
      status: 'Active'
    },
    { 
      ip: '10.0.0.15', 
      reason: 'DDoS attempt', 
      blockedAt: '2024-03-15 10:45:30', 
      attempts: 89,
      location: 'North Korea',
      status: 'Active'
    }
  ];

  const getActionColor = (action) => {
    if (action.includes('Failed')) return 'text-red-600';
    if (action.includes('Success')) return 'text-green-600';
    return 'text-blue-600';
  };

  const getIncidentSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Security & Fraud Detection</h2>
          <p className="text-gray-600 mt-2">Monitor and manage platform security</p>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Security Status</h3>
                <p className="text-2xl font-bold text-green-600">Secure</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Threats</h3>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <LockClosedIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Blocked IPs</h3>
                <p className="text-2xl font-bold text-yellow-600">127</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <KeyIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Failed Logins</h3>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'dashboard', label: 'Dashboard' },
                { key: 'access-logs', label: 'Access Logs' },
                { key: 'incidents', label: 'Incidents' },
                { key: 'blocked-ips', label: 'Blocked IPs' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-[#4E7B22] text-[#4E7B22]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Security Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">System Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Firewall Status</span>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">SSL Certificate</span>
                        <span className="text-sm text-green-600 font-medium">Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">DDoS Protection</span>
                        <span className="text-sm text-green-600 font-medium">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Intrusion Detection</span>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Last security scan: 2 hours ago</div>
                      <div className="text-sm text-gray-600">Threats blocked today: 45</div>
                      <div className="text-sm text-gray-600">Failed login attempts: 1,247</div>
                      <div className="text-sm text-gray-600">Active sessions: 2,847</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'access-logs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Access Logs</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search logs..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button className="bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-[#3d6219] text-sm">
                      Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {accessLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={getActionColor(log.action)}>{log.action}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ipAddress}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'incidents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Security Incidents</h3>
                  <button className="bg-[#4E7B22] text-white px-4 py-2 rounded-lg hover:bg-[#3d6219]">
                    Create Incident
                  </button>
                </div>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{incident.type}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getIncidentSeverityColor(incident.severity)}`}>
                              {incident.severity}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getIncidentStatusColor(incident.status)}`}>
                              {incident.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{incident.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {incident.timestamp}
                            </div>
                            <div className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-1" />
                              {incident.affectedUsers} users affected
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Investigate
                          </button>
                          <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'blocked-ips' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Blocked IP Addresses</h3>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    Add IP Block
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blocked At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blockedIPs.map((ip, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ip.ip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.blockedAt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.attempts}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {ip.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Unblock</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Security;