import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import PropertyReviews from '../../components/common/PropertyReviews';
import { ArrowLeftIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [unavailableDates, setUnavailableDates] = useState({});

  const formatPHPNumber = (value) => Number(value || 0).toLocaleString('en-PH');

  // Fetch availability data when month changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;

      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const response = await axios.get(
          `${apiBaseUrl}/bookings/availability/${id}?year=${year}&month=${month}`
        );
        
        setUnavailableDates(response.data.unavailableDates || {});
      } catch (err) {
        console.error('Error fetching availability:', err);
        setUnavailableDates({});
      }
    };

    fetchAvailability();
  }, [id, currentMonth, apiBaseUrl]);

  // Fetch property details from API
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/properties/${id}`);
        
        // API returns property directly, not wrapped in data object
        const property = response.data;
        
        if (property && property.id) {
          let resolvedHostName = property.hostName || property.hostEmail || '';

          if (!resolvedHostName && property.hostId) {
            try {
              const hostResponse = await axios.get(`${apiBaseUrl}/users/${property.hostId}/basic`);
              const hostData = hostResponse.data || {};
              resolvedHostName = hostData.fullName || hostData.email || '';
            } catch (hostError) {
              console.error('Error resolving host identity:', hostError);
            }
          }

          const address = property.address || {};
          const location = address.fullAddress
            || [address.street, address.city, address.state].filter(Boolean).join(', ')
            || 'Location unavailable';

          setUnit({
            id: property.id,
            title: property.title,
            type: property.type.toUpperCase(),
            rating: property.rating,
            reviews: property.reviewCount,
            location,
            hostId: property.hostId,
            hostName: resolvedHostName || `Host #${property.hostId}`,
            description: property.description,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            maxGuests: property.maxGuests,
            price: property.pricePerNight,
            amenities: property.amenities || [],
            images: property.images || ['/images/property-placeholder.jpg'],
            rules: property.houseRules || property.timeAvailability?.houseRules || 'No smoking. No pets. Check-in after 3 PM. Check-out before 11 AM.',
            bookingType: property.bookingType || 'fixed',
            hourlyRate: property.hourlyRate || null,
            minorsAllowed: true,
            minAge: 0,
            requiresAdultSupervision: true
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
        setSampleProperty();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id, apiBaseUrl]);

  const setSampleProperty = () => {
    setUnit({
      id: 1,
      title: 'Luxury Beachfront Condo',
      type: 'CONDO',
      rating: 4.8,
      reviews: 45,
      location: '123 Ocean Drive, Miami Beach, FL',
      hostId: 3,
      hostName: 'KSSIMPRIAL@GMAIL.COM',
      description: 'Stunning 2-bedroom condo with ocean views, modern amenities, and direct beach access.',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      price: 5000,
      amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Pool', 'Beach Access'],
      images: [
        '/images/luxury-condo-main.jpg',
        '/images/luxury-condo-bedroom.jpg',
        '/images/luxury-condo-kitchen.jpg',
        '/images/luxury-condo-bathroom.jpg',
        '/images/luxury-condo-balcony.jpg'
      ],
      rules: 'No smoking. No pets. Check-in after 3 PM. Check-out before 11 AM.',
      bookingType: 'both',
      hourlyRate: 500,
      minorsAllowed: true,
      minAge: 0,
      requiresAdultSupervision: true
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return '';
    return new Date(dateValue).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDateInRange = (dateValue, startValue, endValue) => {
    if (!dateValue || !startValue || !endValue) return false;
    const date = new Date(dateValue);
    const start = new Date(startValue);
    const end = new Date(endValue);
    return date > start && date < end;
  };

  const handleDateSelect = (dateValue, isUnavailable, isPast) => {
    if (isUnavailable || isPast) {
      return;
    }

    const clickedDate = new Date(dateValue);
    const currentCheckIn = selectedDates.checkIn ? new Date(selectedDates.checkIn) : null;
    const currentCheckOut = selectedDates.checkOut ? new Date(selectedDates.checkOut) : null;

    if (!currentCheckIn || (currentCheckIn && currentCheckOut)) {
      setSelectedDates({
        checkIn: dateValue,
        checkOut: null
      });
      return;
    }

    if (clickedDate <= currentCheckIn) {
      setSelectedDates({
        checkIn: dateValue,
        checkOut: null
      });
      return;
    }

    setSelectedDates({
      checkIn: selectedDates.checkIn,
      checkOut: dateValue
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateValue = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateKey = dateValue.toISOString().split('T')[0];
      const checkIn = selectedDates.checkIn;
      const checkOut = selectedDates.checkOut;

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = dateValue < today;

      // Check if date is unavailable from backend
      const isUnavailable = unavailableDates[dateKey] === true;
      const isSelectedCheckIn = checkIn && new Date(checkIn).toDateString() === dateValue.toDateString();
      const isSelectedCheckOut = checkOut && new Date(checkOut).toDateString() === dateValue.toDateString();
      const isInSelectedRange = isDateInRange(dateKey, checkIn, checkOut);

      let dayClass = 'h-10 w-10 flex items-center justify-center text-sm rounded transition-colors ';

      if (isSelectedCheckIn || isSelectedCheckOut) {
        dayClass += 'bg-green-500 text-white cursor-pointer';
      } else if (isInSelectedRange) {
        dayClass += 'bg-green-100 text-green-800 cursor-pointer';
      } else if (isPast) {
        dayClass += 'bg-gray-300 text-gray-500 cursor-not-allowed line-through';
      } else if (isUnavailable) {
        dayClass += 'bg-orange-200 text-orange-800 cursor-not-allowed';
      } else {
        dayClass += 'bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer';
      }

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(dateKey, isUnavailable, isPast)}
          className={dayClass}
          disabled={isUnavailable || isPast}
          title={isPast ? 'Past date' : isUnavailable ? 'Unavailable date' : 'Select date'}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        <div className="flex justify-between mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-200 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Past</span>
          </div>
        </div>
      </div>
    );
  };

  const handleAskHost = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!unit?.hostId) {
      return;
    }

    navigate('/guest/messages', {
      state: {
        targetUserId: unit.hostId,
        propertyId: unit.id,
        propertyTitle: unit.title,
        hostName: unit.hostName
      }
    });
  };

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/guest/units')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-3 text-gray-500">Loading property details...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-700">
            <p>{error}</p>
            <button 
              onClick={() => navigate('/guest/units')}
              className="mt-4 text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90"
              style={{backgroundColor: '#4E7B22'}}
            >
              Back to Properties
            </button>
          </div>
        )}

        {!loading && !error && unit && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image with Navigation */}
          <div className="relative">
            <div className="h-96 bg-gray-200 rounded-lg relative overflow-hidden">
              <img
                src={unit.images?.[currentImageIndex] || '/images/property-placeholder.jpg'}
                alt={`${unit.title} ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/property-placeholder.jpg';
                }}
              />
              
              {/* Navigation Arrows */}
              {unit.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : unit.images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all z-10"
                  >
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => setCurrentImageIndex(currentImageIndex < unit.images.length - 1 ? currentImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all z-10"
                  >
                    <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-10">
                    {currentImageIndex + 1} / {unit.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {unit.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {unit.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentImageIndex === index 
                        ? 'bg-green-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side - All Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center space-x-2`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span>{unit.type}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-lg font-bold text-gray-900">{unit.rating}</span>
                <span className="text-gray-600">({unit.reviews})</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{unit.title}</h1>
            </div>

            {/* Location and Host */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span>{unit.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>Hosted by </span>
                <button 
                  onClick={() => navigate(`/guest/host/${unit.hostId}`)}
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  {unit.hostName}
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{unit.description}</p>

            {/* Property Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-red-500 text-2xl mb-1">🛏️</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
                <div className="font-semibold">{unit.bedrooms}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-blue-500 text-2xl mb-1">🚿</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
                <div className="font-semibold">{unit.bathrooms}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-yellow-500 text-2xl mb-1">👥</div>
                <div className="text-sm text-gray-600">Max Guests</div>
                <div className="font-semibold">{unit.maxGuests}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-green-500 text-2xl mb-1">💰</div>
                <div className="text-sm text-gray-600">Per Night</div>
                <div className="font-semibold">₱{formatPHPNumber(unit.price)}</div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <span className="text-2xl font-bold text-green-600">₱{formatPHPNumber(unit.price)}</span>
                <span className="text-gray-600">/night</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAskHost}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Ask</span>
                </button>
                <button 
                  onClick={() => navigate(`/guest/units/${id}/book`)}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90" 
                  style={{backgroundColor: '#4E7B22'}}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Amenities */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">TOP AMENITIES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {(unit.bookingType === 'fixed' || unit.bookingType === 'both') && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-800">Booking Option: Fixed Time</p>
                  <p className="text-sm text-green-700">₱{formatPHPNumber(unit.price)}/night</p>
                </div>
              </div>
            )}

            {(unit.bookingType === 'hourly' || unit.bookingType === 'both') && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Booking Option: Hourly</p>
                  <p className="text-sm text-blue-700">₱{formatPHPNumber(unit.hourlyRate)}/hour</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {unit.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-2 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Availability */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Location & Availability</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Location */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <MapPinIcon className="w-4 h-4" />
                <span>{unit.location}</span>
              </div>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <iframe
                  title="Property location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(unit.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Check Availability</h4>
              <p className="text-gray-600 text-sm mb-4">Select your check-in and check-out dates</p>
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                <p className="text-gray-700">
                  Check-in: <span className="font-medium">{selectedDates.checkIn ? formatDateLabel(selectedDates.checkIn) : 'Not selected'}</span>
                </p>
                <p className="text-gray-700 mt-1">
                  Check-out: <span className="font-medium">{selectedDates.checkOut ? formatDateLabel(selectedDates.checkOut) : 'Not selected'}</span>
                </p>
              </div>
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* House Rules */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h3>
          <p className="text-red-600">{unit.rules}</p>
        </div>

        {/* Reviews Section */}
        <PropertyReviews propertyId={id} />
        </>
        )}
      </div>
    </GuestLayout>
  );
};

export default UnitDetails;