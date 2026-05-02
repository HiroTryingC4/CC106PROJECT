import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import FeedbackModal from '../../components/common/FeedbackModal';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { handleImageFileSelect, uploadImageToCloudinary } from '../../utils/fileUpload';
import API_CONFIG from '../../config/api';
import { 
  PlusIcon,
  MapPinIcon,
  InformationCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EditUnit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token: authToken, user } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;
  
  const [formData, setFormData] = useState({
    unitName: '',
    propertyType: 'Apartment',
    location: '',
    pricePerNight: '',
    bookingType: 'fixed',
    hourlyRate: '',
    hoursIncluded: '22 hours',
    bedrooms: '1',
    bathrooms: '1',
    maxGuests: '4',
    securityDeposit: '1,000',
    extraGuestFee: '300',
    description: '',
    unitRules: '',
    amenities: [],
    autoConfirmation: false,
    paymentMethods: {
      cash: true,
      bankTransfer: false,
      gcash: false,
      paymaya: false,
      paypal: false
    },
    qrCodes: {
      gcash: null,
      paymaya: null,
      paypal: null
    }
  });

  const [showMap, setShowMap] = useState(false);
  const [hourlyPricing, setHourlyPricing] = useState([]);
  const [mapPosition, setMapPosition] = useState([14.5995, 120.9842]); // Default to Manila, Philippines
  const [markerPosition, setMarkerPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    actionLabel: 'Close',
    onAction: null
  });
  const fileInputRef = React.useRef(null);

  const formatPHP = (value) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  // Load existing unit data
  useEffect(() => {
    const loadUnitData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/properties/${id}`);

        if (!response.ok) {
          throw new Error('Property not found');
        }

        const unitData = await response.json();
        const addressText = typeof unitData.address === 'string'
          ? unitData.address
          : unitData.address?.fullAddress || unitData.address?.city || '';

        setFormData({
          unitName: unitData.title || '',
          propertyType: unitData.type || 'Apartment',
          location: addressText,
          pricePerNight: unitData.pricePerNight?.toString() || '',
          bookingType: unitData.bookingType || 'fixed',
          hourlyRate: unitData.hourlyRate?.toString() || '',
          hoursIncluded: '22 hours',
          bedrooms: unitData.bedrooms?.toString() || '1',
          bathrooms: unitData.bathrooms?.toString() || '1',
          maxGuests: unitData.maxGuests?.toString() || '4',
          securityDeposit: '0',
          extraGuestFee: (unitData.extraGuestFee ?? unitData.timeAvailability?.extraGuestFee ?? 0).toString(),
          description: unitData.description || '',
          unitRules: unitData.houseRules || unitData.timeAvailability?.houseRules || '',
          amenities: unitData.amenities || [],
          autoConfirmation: true,
          paymentMethods: {
            cash: true,
            bankTransfer: false,
            gcash: false,
            paymaya: false,
            paypal: false
          },
          qrCodes: {
            gcash: null,
            paymaya: null,
            paypal: null
          }
        });

        setUploadedImages(unitData.images || []);

        if (Array.isArray(unitData.images) && unitData.images.length > 0) {
          setMarkerPosition(null);
        }

        if (addressText) {
          setMapPosition([14.5995, 120.9842]);
        }
      } catch (error) {
        console.error('Error loading property:', error);
        alert('Unable to load this unit for editing.');
        navigate('/host/units');
      } finally {
        setLoading(false);
      }
    };

    loadUnitData();
  }, [id, apiBaseUrl, navigate]);

  // Component for handling map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        setFormData(prev => ({
          ...prev,
          location: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
        }));
      },
    });

    return markerPosition === null ? null : (
      <Marker position={markerPosition}>
        <Popup>
          Property Location<br />
          Lat: {markerPosition[0].toFixed(6)}<br />
          Lng: {markerPosition[1].toFixed(6)}
        </Popup>
      </Marker>
    );
  };

  // Component to update map center
  const MapUpdater = () => {
    const map = useMapEvents({});
    
    React.useEffect(() => {
      map.setView(mapPosition, 13);
    }, [mapPosition, map]);
    
    return null;
  };

  // Function to search for location
  const handleLocationSearch = async () => {
    if (!formData.location.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&countrycodes=ph&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapPosition([lat, lon]);
        setMarkerPosition([lat, lon]);
        setFormData(prev => ({
          ...prev,
          location: data[0].display_name
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const amenitiesList = [
    'Wifi', 'Gym', 'Washer', 'Netflix Premium',
    'Dryer', 'Balcony', 'Games', 'Free unli popcorn',
    'Pool', 'Pet Friendly', 'Parking', 'Free unli coffee'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method]
      }
    }));
  };

  const handleQRCodeUpload = (method, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          qrCodes: {
            ...prev.qrCodes,
            [method]: e.target.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQRCode = (method) => {
    setFormData(prev => ({
      ...prev,
      qrCodes: {
        ...prev.qrCodes,
        [method]: null
      }
    }));
  };

  const addHourlyPricing = () => {
    setHourlyPricing([...hourlyPricing, { hours: '', price: '' }]);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (e) => {
    try {
      const didStart = handleImageFileSelect(e, async (fileData) => {
        try {
          const imageUrl = await uploadImageToCloudinary(fileData.file);
          setUploadedImages(prev => [...prev, imageUrl]);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });

      setUploadingImage(Boolean(didStart));
    } catch (error) {
      console.error('Error selecting image:', error);
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const payload = {
        title: formData.unitName,
        description: formData.description,
        type: formData.propertyType,
        bedrooms: parseInt(formData.bedrooms, 10) || 1,
        bathrooms: parseInt(formData.bathrooms, 10) || 1,
        maxGuests: parseInt(formData.maxGuests, 10) || 1,
        pricePerNight: parseFloat((formData.pricePerNight || '').replace(/,/g, '')) || 0,
        bookingType: formData.bookingType,
        hourlyRate: (formData.bookingType === 'hourly' || formData.bookingType === 'both')
          ? (parseFloat((formData.hourlyRate || '').replace(/,/g, '')) || null)
          : null,
        extraGuestFee: parseFloat((formData.extraGuestFee || '').replace(/,/g, '')) || 0,
        houseRules: formData.unitRules,
        address: {
          fullAddress: formData.location,
          city: formData.location,
          state: 'N/A'
        },
        amenities: formData.amenities,
        images: uploadedImages,
        availability: true,
        timeAvailability: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          extraGuestFee: parseFloat((formData.extraGuestFee || '').replace(/,/g, '')) || 0,
          houseRules: formData.unitRules
        }
      };

      const response = await fetch(`${apiBaseUrl}/properties/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const fallbackMessage = response.status === 404
          ? 'Property not found or access denied. Please confirm you are logged in as the unit host.'
          : 'Failed to update property';
        throw new Error(errorData.message || fallbackMessage);
      }

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Unit Updated',
        message: 'Your unit was updated successfully.',
        actionLabel: 'Back to Units',
        onAction: () => navigate('/host/units')
      });
    } catch (error) {
      console.error('Update unit error:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Unable to Update Unit',
        message: error.message || 'Failed to update unit. Please try again.',
        actionLabel: 'Close',
        onAction: null
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading unit data...</p>
          </div>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        actionLabel={feedbackModal.actionLabel}
        onAction={feedbackModal.onAction}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
          <p className="text-gray-600 mt-2">Update your property information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleInputChange}
                  placeholder="e.g., Cozy Downtown Apartment"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Studio">Studio</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>
            </div>

            {/* Location and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Makati City, Metro Manila"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-20"
                  />
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Night (₱)</label>
                <input
                  type="text"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  placeholder="e.g., 1500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours included</label>
                <select
                  name="hoursIncluded"
                  value={formData.hoursIncluded}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="22 hours">22 hours</option>
                  <option value="12 hours">12 hours</option>
                  <option value="24 hours">24 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Option</label>
                <select
                  name="bookingType"
                  value={formData.bookingType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="fixed">Fixed Time</option>
                  <option value="hourly">Hourly</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            {(formData.bookingType === 'hourly' || formData.bookingType === 'both') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (₱)</label>
                  <input
                    type="text"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Map Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">How to use the map:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Enter your address in the location field and click "Search" to find it on the map</li>
                    <li>• Click anywhere on the map to place or move the location marker</li>
                    <li>• The marker shows the exact location that will be displayed to guests</li>
                    <li>• You can drag the map to explore different areas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <MapContainer
                center={mapPosition}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater />
                <LocationMarker />
              </MapContainer>
              
              {/* Map Status */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                {markerPosition ? (
                  <div className="flex items-center space-x-2 text-green-700">
                    <MapPinIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Location selected: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <InformationCircleIcon className="w-5 h-5" />
                    <span className="text-sm">
                      Click on the map to set your property location
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Per night pricing:</strong> Set your overnight rate and how many hours it covers. e.g., ₱1500 for 22 hours means guest get the unit from 2pm to 12pm next day.
                  </p>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <input
                  type="text"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <input
                  type="text"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests</label>
                <input
                  type="text"
                  name="maxGuests"
                  value={formData.maxGuests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit</label>
                <input
                  type="text"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Extra Guest Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extra Guests Fee (per person/night)</label>
              <input
                type="text"
                name="extraGuestFee"
                value={formData.extraGuestFee}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    <strong>Extra Guests Fee:</strong> Additional charge per extra guest beyond base capacity.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Unit Rules */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit's Rules</label>
              <textarea
                name="unitRules"
                value={formData.unitRules}
                onChange={handleInputChange}
                placeholder="e.g., No smoking, No pets, Check-in before 3 PM, Check-out before 11 AM"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Accepted Payment Methods</label>
              <div className="space-y-6">
                {/* Payment Method Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.cash}
                      onChange={() => handlePaymentMethodChange('cash')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Cash Payment</span>
                      <p className="text-xs text-gray-500">Accept cash payments on-site</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.bankTransfer}
                      onChange={() => handlePaymentMethodChange('bankTransfer')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
                      <p className="text-xs text-gray-500">Direct bank account transfer</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.gcash}
                      onChange={() => handlePaymentMethodChange('gcash')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">GCash</span>
                      <p className="text-xs text-gray-500">Mobile wallet payment</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.paymaya}
                      onChange={() => handlePaymentMethodChange('paymaya')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">PayMaya</span>
                      <p className="text-xs text-gray-500">Digital wallet payment</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods.paypal}
                      onChange={() => handlePaymentMethodChange('paypal')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">PayPal</span>
                      <p className="text-xs text-gray-500">International online payment</p>
                    </div>
                  </label>
                </div>

                {/* QR Code Upload Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">QR Codes for Online Payments</h4>
                  <p className="text-xs text-gray-500">Upload QR codes for selected online payment methods to make it easier for guests to pay</p>
                  
                  {/* GCash QR Code */}
                  {formData.paymentMethods.gcash && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">GCash QR Code</h5>
                        {formData.qrCodes.gcash && (
                          <button
                            type="button"
                            onClick={() => removeQRCode('gcash')}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {formData.qrCodes.gcash ? (
                        <div className="flex items-center space-x-4">
                          <img 
                            src={formData.qrCodes.gcash} 
                            alt="GCash QR Code" 
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <div>
                            <p className="text-sm text-green-600 font-medium">QR Code uploaded</p>
                            <p className="text-xs text-gray-500">Guests can scan this code to pay via GCash</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQRCodeUpload('gcash', e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Upload your GCash QR code image</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PayMaya QR Code */}
                  {formData.paymentMethods.paymaya && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">PayMaya QR Code</h5>
                        {formData.qrCodes.paymaya && (
                          <button
                            type="button"
                            onClick={() => removeQRCode('paymaya')}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {formData.qrCodes.paymaya ? (
                        <div className="flex items-center space-x-4">
                          <img 
                            src={formData.qrCodes.paymaya} 
                            alt="PayMaya QR Code" 
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <div>
                            <p className="text-sm text-green-600 font-medium">QR Code uploaded</p>
                            <p className="text-xs text-gray-500">Guests can scan this code to pay via PayMaya</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQRCodeUpload('paymaya', e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Upload your PayMaya QR code image</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PayPal QR Code */}
                  {formData.paymentMethods.paypal && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">PayPal QR Code</h5>
                        {formData.qrCodes.paypal && (
                          <button
                            type="button"
                            onClick={() => removeQRCode('paypal')}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {formData.qrCodes.paypal ? (
                        <div className="flex items-center space-x-4">
                          <img 
                            src={formData.qrCodes.paypal} 
                            alt="PayPal QR Code" 
                            className="w-20 h-20 object-cover rounded border"
                          />
                          <div>
                            <p className="text-sm text-green-600 font-medium">QR Code uploaded</p>
                            <p className="text-xs text-gray-500">Guests can scan this code to pay via PayPal</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQRCodeUpload('paypal', e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Upload your PayPal QR code image</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Methods Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Payment Method Tips:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Select multiple payment methods to give guests more options</li>
                        <li>• QR codes make online payments faster and more convenient</li>
                        <li>• Cash payments are processed on check-in/check-out</li>
                        <li>• Online payments are processed immediately upon booking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Confirmation */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 mb-2">Auto-Confirmation (Instant Booking)</h4>
                  <p className="text-sm text-yellow-700 mb-4">When enabled, bookings are automatically confirmed without requiring your approval.</p>
                  
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <InformationCircleIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {formData.autoConfirmation ? 'Auto-Confirmation Enabled' : 'Manual Approval Required'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formData.autoConfirmation 
                            ? 'Guests can book instantly without waiting for approval.'
                            : 'You\'ll need to manually approve each booking request.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    name="autoConfirmation"
                    checked={formData.autoConfirmation}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            {/* Property Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Images</h3>
              <p className="text-sm text-gray-600 mb-4">Update the images shown for this unit</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              {uploadedImages.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={uploadingImage}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg mb-2 flex items-center space-x-2 mx-auto hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading...' : 'Add Photos'}</span>
                  </button>
                  <p className="text-sm text-gray-500">No Photos Selected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handlePhotoUpload}
                      disabled={uploadingImage}
                      className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center hover:border-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <PlusIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600 font-medium">{uploadingImage ? 'Uploading...' : 'Add More'}</span>
                      </div>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{uploadedImages.length} photo(s) selected</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/host/units')}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                {saving ? 'Updating...' : 'Update Unit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HostLayout>
  );
};

export default EditUnit;