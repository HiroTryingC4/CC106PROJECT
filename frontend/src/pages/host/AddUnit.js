import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HostLayout from '../../components/common/HostLayout';
import FeedbackModal from '../../components/common/FeedbackModal';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  PlusIcon,
  MapPinIcon,
  InformationCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { handleImageFileSelect, uploadImageToCloudinary } from '../../utils/fileUpload';
import API_CONFIG from '../../config/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddUnit = () => {
  const navigate = useNavigate();
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
    images: [],
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
  const [timeAvailability, setTimeAvailability] = useState({
    checkInTime: '15:00',    // 3:00 PM default
    checkOutTime: '11:00',   // 11:00 AM default
    enableTimeSlots: true
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    actionLabel: 'Close',
    onAction: null
  });
  const fileInputRef = React.useRef(null);

  // Component for handling map clicks
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        // Reverse geocoding could be added here to update the location input
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

  // Function to search for location (simplified)
  const handleLocationSearch = async () => {
    if (!formData.location.trim()) return;
    
    try {
      // Using a simple geocoding service (you can replace with your preferred service)
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

  const handleAddUnitImageSelect = async (e) => {
    try {
      const didStart = handleImageFileSelect(e, async (fileData) => {
        try {
          // Upload to Cloudinary
          const imageUrl = await uploadImageToCloudinary(fileData.file);
          
          // Add to uploaded images state
          setUploadedImages(prev => [...prev, imageUrl]);
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), imageUrl]
          }));

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
        }
      });

      if (didStart) {
        setUploadingImage(true);
      } else {
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

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
        images: formData.images || [],
        availability: true,
        timeAvailability: {
          ...timeAvailability,
          extraGuestFee: parseFloat((formData.extraGuestFee || '').replace(/,/g, '')) || 0,
          houseRules: formData.unitRules
        }
      };

      const response = await fetch(`${apiBaseUrl}/properties`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create property');
      }

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Unit Created',
        message: 'Your unit was created successfully.',
        actionLabel: 'Back to Units',
        onAction: () => navigate('/host/units')
      });
    } catch (error) {
      console.error('Create unit error:', error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Unable to Create Unit',
        message: error.message || 'Failed to create unit. Please try again.',
        actionLabel: 'Close',
        onAction: null
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Unit</h1>
          <p className="text-gray-600 mt-2">Add a new property to your listings</p>
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

            {/* Time Availability */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <InformationCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Fixed Time Slots</h3>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Set your availability hours:</strong> Define when guests can check-in and check-out. Only these time slots will be available for booking.
                </p>
                <ul className="text-xs text-green-700 space-y-1 ml-4">
                  <li>• Example: Check-in at 6:00 AM, Check-out at 12:00 AM (midnight)</li>
                  <li>• Guests will only see these times as available options</li>
                  <li>• This applies to all bookings on your unit</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={timeAvailability.checkInTime}
                    onChange={(e) => setTimeAvailability(prev => ({
                      ...prev,
                      checkInTime: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {new Date(`2000-01-01T${timeAvailability.checkInTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={timeAvailability.checkOutTime}
                    onChange={(e) => setTimeAvailability(prev => ({
                      ...prev,
                      checkOutTime: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {new Date(`2000-01-01T${timeAvailability.checkOutTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Example:</strong> If you set Check-in at 6:00 AM and Check-out at 12:00 AM, guests will only be able to book during these hours. The system will only show these time slots when making a reservation.
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
                <label className="block text-sm font-medium text-gray-700 mb-2">bathrooms</label>
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
                    <strong>Extra Guests Fee:</strong> Additional charge per extra guest beyond base capacity. e.g., if max guests is 4 and booking is for 3 guests, the extra guest fee will be added to the total price.
                  </p>
                </div>
              </div>
            </div>

            {/* Hourly Pricing Options */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hourly Pricing options</h3>
                  <p className="text-sm text-gray-600">Add multiple time-based pricing options for your guests (e.g., 6 hours for ₱599, 10 hours for ₱999)</p>
                </div>
                <button
                  type="button"
                  onClick={addHourlyPricing}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Pricing</span>
                </button>
              </div>
              
              {hourlyPricing.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                  <p className="text-gray-600 mb-2">No hourly pricing options added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Pricing" to create time-based pricing options</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hourlyPricing.map((pricing, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        placeholder="Hours (e.g., 6)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        placeholder="Price (e.g., 599)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>
              )}
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
                  <p className="text-sm text-yellow-700 mb-4">When enabled, bookings are automatically confirmed without requiring your approval. Guests can book instantly.</p>
                  
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
                            : 'You\'ll need to manually approve each booking request. Guests will wait for your confirmation.'
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

            {/* Property Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Images</h3>
              <p className="text-sm text-gray-600 mb-4">Select property images</p>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAddUnitImageSelect}
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
                  <p className="text-xs text-gray-400 mt-2">Max size: 5MB per file. Multiple files allowed.</p>
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

            {/* Form Actions */}
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
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                Create Unit
              </button>
            </div>
          </form>
        </div>
      </div>
    </HostLayout>
  );
};

export default AddUnit;