import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import { 
  HomeIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';

const PropertyManagement = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
      setError('');
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (propertyId) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return;
    if (!window.confirm(`Delete ${selectedProperties.length} selected properties?`)) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await Promise.all(
        selectedProperties.map(id =>
          fetch(`${API_CONFIG.BASE_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: 'include'
          })
        )
      );
      
      setSelectedProperties([]);
      fetchProperties();
    } catch (err) {
      console.error('Error deleting properties:', err);
      alert('Failed to delete some properties');
    }
  };

  const handleBulkStatusChange = async (availability) => {
    if (selectedProperties.length === 0) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await Promise.all(
        selectedProperties.map(id =>
          fetch(`${API_CONFIG.BASE_URL}/properties/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            credentials: 'include',
            body: JSON.stringify({ availability })
          })
        )
      );
      
      setSelectedProperties([]);
      fetchProperties();
    } catch (err) {
      console.error('Error updating properties:', err);
      alert('Failed to update some properties');
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return property.availability === true;
    if (filterStatus === 'inactive') return property.availability === false;
    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'price-high') return (b.pricePerNight || 0) - (a.pricePerNight || 0);
    if (sortBy === 'price-low') return (a.pricePerNight || 0) - (b.pricePerNight || 0);
    if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const getStatusBadge = (property) => {
    if (property.availability) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircleIcon className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <HostLayout>
        <div className="p-6 text-gray-600">Loading properties...</div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600 mt-2">Manage all your properties in one place</p>
          </div>
          <button
            onClick={() => navigate('/host/units/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Add Property</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters and Bulk Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Properties</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
              </select>
            </div>

            {selectedProperties.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedProperties.length} selected
                </span>
                <button
                  onClick={() => handleBulkStatusChange(true)}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusChange(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === sortedProperties.length && sortedProperties.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Night
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProperties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No properties found. <button onClick={() => navigate('/host/units/new')} className="text-blue-600 hover:underline">Add your first property</button>
                  </td>
                </tr>
              ) : (
                sortedProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property.id)}
                        onChange={() => handleSelectProperty(property.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {property.images?.[0] ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                              <HomeIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500">{property.address?.city || 'No location'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₱{(property.pricePerNight || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(property)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ⭐ {property.rating || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/guest/units/${property.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/host/units/${property.id}/edit`)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this property?')) return;
                            try {
                              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                              await fetch(`${API_CONFIG.BASE_URL}/properties/${property.id}`, {
                                method: 'DELETE',
                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                credentials: 'include'
                              });
                              fetchProperties();
                            } catch (err) {
                              alert('Failed to delete property');
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <HomeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Properties</p>
                <p className="text-2xl font-bold text-green-600">
                  {properties.filter(p => p.availability).length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Properties</p>
                <p className="text-2xl font-bold text-gray-600">
                  {properties.filter(p => !p.availability).length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </HostLayout>
  );
};

export default PropertyManagement;
