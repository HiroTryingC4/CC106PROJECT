import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PhotoIcon,
  MapPinIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { handleImageFileSelect, uploadImageToCloudinary } from '../../utils/fileUpload';
import API_CONFIG from '../../config/api';

const HostUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImageId, setUploadingImageId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const fileInputRef = React.useRef(null);

  const formatPHP = (value) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  // Fetch host ID and verification status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Extract host ID from token (format: token_userId_timestamp)
        const userId = parseInt(token.split('_')[1]);
        setHostId(userId);

        // Fetch verification status
        const verifyResponse = await fetch(`${API_CONFIG.BASE_URL}/host/verification-status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          setVerificationStatus(verifyData);

          // Fetch properties if verified
          if (['verified', 'approved'].includes(verifyData.status) || verifyData.verified === true) {
            await fetchProperties(token, userId);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setVerificationStatus({
          status: 'not_submitted',
          message: 'Complete your verification to unlock all host features.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchProperties = async (token, userId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties?hostId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Map database properties to match UI format
        const formattedProperties = data.properties.map(prop => ({
          ...prop,
          name: prop.title,
          location: prop.address?.city ? `${prop.address.city}, ${prop.address.state}` : 'Unknown',
          guests: prop.maxGuests,
          price: formatPHP(prop.pricePerNight),
          status: prop.availability ? 'active' : 'inactive',
          bookings: 0,
          revenue: formatPHP(0),
          rating: prop.rating,
          reviews: prop.reviewCount,
          occupancy: 0,
          image: prop.images && prop.images.length > 0 ? prop.images[0] : null
        }));
        setProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  // Check if user is verified
  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

  const handleDeleteProperty = async (propertyId, propertyName) => {
    if (window.confirm(`Are you sure you want to delete "${propertyName}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setProperties(properties.filter(p => p.id !== propertyId));
          alert('Property deleted successfully!');
        } else {
          alert('Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property');
      }
    }
  };

  const handleImageUpload = (propertyId) => {
    // Store propertyId in data attribute for later use
    fileInputRef.current?.setAttribute('data-property-id', propertyId);
    fileInputRef.current?.click();
  };

  const handlePropertyImageSelect = async (e) => {
    const propertyId = fileInputRef.current?.getAttribute('data-property-id');
    if (!propertyId) return;

    try {
      const didStart = handleImageFileSelect(e, async (fileData) => {
        try {
          // Upload to Cloudinary
          const imageUrl = await uploadImageToCloudinary(fileData.file);

          // Update property in database
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const propertyToUpdate = properties.find(p => p.id === parseInt(propertyId));
          const images = propertyToUpdate.images || [];

          const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              images: [imageUrl, ...images]
            })
          });

          if (response.ok) {
            // Update property in state
            setProperties(properties.map(p =>
              p.id === parseInt(propertyId)
                ? { ...p, image: imageUrl, images: [imageUrl, ...images] }
                : p
            ));
          } else {
            alert('Failed to save image to database');
          }

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setUploadingImageId(null);
        }
      });

      if (didStart) {
        setUploadingImageId(propertyId);
      } else {
        setUploadingImageId(null);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      setUploadingImageId(null);
    }
  };

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePropertyImageSelect}
        style={{ display: 'none' }}
      />
      
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
            <p className="text-3xl font-bold text-blue-600">{properties.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600">{properties.filter(p => p.status === 'active').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">{formatPHP(properties.reduce((sum, p) => sum + (Number(p.pricePerNight) || 0), 0))}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg. Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">{properties.length > 0 ? (properties.reduce((sum, p) => sum + (p.rating || 0), 0) / properties.length).toFixed(1) : '0'}</p>
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
        {loading ? (
          <LoadingSpinner text="Loading properties..." />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 flex flex-col h-full">
              {/* Property Image */}
              <div className="relative h-64 bg-gray-100">
                {property.image ? (
                  <>
                    <img 
                      src={property.image} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleImageUpload(property.id)}
                      disabled={uploadingImageId === property.id}
                      className="absolute bottom-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CloudArrowUpIcon className="w-4 h-4" />
                      <span>{uploadingImageId === property.id ? 'Uploading...' : 'Change'}</span>
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-3">No Image</p>
                      <button
                        onClick={() => handleImageUpload(property.id)}
                        disabled={uploadingImageId === property.id}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingImageId === property.id ? 'Uploading...' : 'Upload Image'}
                      </button>
                    </div>
                  </div>
                )}
                
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
              <div className="p-6 flex flex-col flex-1">
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
                    <p className="text-sm text-gray-500">Max Guests:</p>
                    <p className="font-semibold text-gray-900">{property.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms:</p>
                    <p className="font-semibold text-gray-900">{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms:</p>
                    <p className="font-semibold text-gray-900">{property.bathrooms}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Price per Night:</p>
                  <p className="text-2xl font-bold text-green-600">{property.price}</p>
                </div>

                {/* Reviews */}
                <div className="mb-6 min-h-6">
                  <Link
                    to={`/host/units/${property.id}/reviews`}
                    className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
                  >
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {property.reviews > 0 ? `${property.rating} (${property.reviews} reviews)` : '0.0 (0 reviews)'}
                    </span>
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-auto">
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

        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
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