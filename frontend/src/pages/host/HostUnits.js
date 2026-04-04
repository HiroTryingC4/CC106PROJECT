import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PhotoIcon,
  MapPinIcon,
  StarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch verification status when component mounts
    const fetchVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/host/verification-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(data);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        // Set default status if API fails
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, []);

  // Check if user is verified
  const isVerified = verificationStatus?.status === 'verified';

  const handleDeleteProperty = (propertyId, propertyName) => {
    if (window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
      // In a real app, this would call an API to delete the property
      console.log(`Deleting property ${propertyId}`);
      alert('Property deleted successfully!');
      // You would typically refresh the data here
    }
  };

  // Show empty properties for unverified hosts
  const properties = isVerified ? [
    {
      id: 1,
      name: 'Luxury Beachfront Condo',
      location: 'Boracay, Philippines',
      type: 'Condo',
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      price: '₱2,500',
      status: 'active',
      bookings: 12,
      revenue: '₱54,000',
      rating: 4.9,
      reviews: 45,
      occupancy: 85,
      image: '/images/property1.jpg',
      amenities: ['WiFi', 'Pool', 'Beach Access', 'Kitchen']
    },
    {
      id: 2,
      name: 'Downtown Studio',
      location: 'Makati, Manila',
      type: 'Studio',
      bedrooms: 1,
      bathrooms: 1,
      guests: 2,
      price: '₱1,800',
      status: 'active',
      bookings: 8,
      revenue: '₱24,000',
      rating: 4.7,
      reviews: 28,
      occupancy: 72,
      image: '/images/property2.jpg',
      amenities: ['WiFi', 'Gym', 'Parking', 'Kitchen']
    },
    {
      id: 3,
      name: 'Mountain View Cabin',
      location: 'Baguio, Philippines',
      type: 'Cabin',
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      price: '₱3,200',
      status: 'inactive',
      bookings: 6,
      revenue: '₱18,000',
      rating: 4.8,
      reviews: 22,
      occupancy: 68,
      image: '/images/property3.jpg',
      amenities: ['WiFi', 'Fireplace', 'Mountain View', 'Kitchen']
    },
    {
      id: 4,
      name: 'City Center Apartment',
      location: 'Cebu City, Philippines',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 1,
      guests: 4,
      price: '₱2,100',
      status: 'active',
      bookings: 10,
      revenue: '₱32,000',
      rating: 4.6,
      reviews: 35,
      occupancy: 78,
      image: '/images/property4.jpg',
      amenities: ['WiFi', 'Air Con', 'City View', 'Kitchen']
    }
  ] : [];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HostLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-2">Manage your property listings and performance</p>
          </div>
          {isVerified ? (
            <Link 
              to="/host/units/add"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add New Property</span>
            </Link>
          ) : (
            <button 
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed flex items-center space-x-2 font-medium"
              title="Complete verification to add properties"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add New Property</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Properties</h3>
            <p className="text-3xl font-bold text-blue-600">{isVerified ? properties.length : 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600">{isVerified ? properties.filter(p => p.status === 'active').length : 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">{isVerified ? '₱128,000' : '₱0'}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg. Occupancy</h3>
            <p className="text-3xl font-bold text-yellow-600">{isVerified ? '76%' : '0%'}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search properties by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              {/* Property Image */}
              <div className="relative h-64 bg-gray-100">
                {/* Property Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">Property Image</p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    property.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : property.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                {/* Property Name and Location */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                </div>

                {/* Property Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Type:</p>
                    <p className="font-semibold text-gray-900">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hourly Type:</p>
                    <p className="font-semibold text-gray-900">Flexible</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms:</p>
                    <p className="font-semibold text-gray-900">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time:</p>
                    <p className="font-semibold text-gray-900">1:00 pm - 5:00pm</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Price:</p>
                  <p className="text-2xl font-bold text-green-600">{property.price}/night</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    to={`/host/units/edit/${property.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="font-medium">Edit</span>
                  </Link>
                  <button 
                    onClick={() => handleDeleteProperty(property.id, property.name)}
                    className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            {!isVerified ? (
              <>
                <div className="text-gray-400 mb-4">
                  <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties available</h3>
                <p className="text-gray-600 mb-6">Complete verification to start listing your properties.</p>
                <Link 
                  to="/host/verification"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                >
                  <span>Complete Verification</span>
                </Link>
              </>
            ) : (
              <>
                <div className="text-gray-400 mb-4">
                  <PhotoIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
                <Link 
                  to="/host/units/add"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Your First Property</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostUnits;