import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';

const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // February 2026
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample unit data - in real app this would come from API
  const unit = {
    id: 1,
    title: 'Luxury Beachfront Condo',
    type: 'CONDO',
    rating: 4.8,
    reviews: 45,
    location: '123 Ocean Drive, Miami Beach, FL',
    host: 'KSSIMPRIAL@GMAIL.COM',
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
    bookingType: 'both', // 'fixed', 'hourly', or 'both'
    hourlyRate: 500, // hourly rate if applicable
    minorsAllowed: true,
    minAge: 0, // minimum age allowed (0 means no restriction)
    requiresAdultSupervision: true // if minors need adult supervision
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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
      const isSelected = day === 23;
      const isAvailable = day >= 15 && day <= 25;
      const isUnavailable = day < 15 || day > 25;

      let dayClass = 'h-10 w-10 flex items-center justify-center text-sm cursor-pointer rounded ';
      
      if (isSelected) {
        dayClass += 'bg-green-500 text-white';
      } else if (isAvailable) {
        dayClass += 'bg-gray-100 text-gray-900 hover:bg-gray-200';
      } else if (isUnavailable) {
        dayClass += 'bg-orange-200 text-orange-800 cursor-not-allowed';
      }

      days.push(
        <div key={day} className={dayClass}>
          {day}
        </div>
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
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    );
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Image with Navigation */}
          <div className="relative">
            <div className="h-96 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg relative overflow-hidden">
              {/* Dynamic background based on current image */}
              <div className={`h-full w-full bg-gradient-to-br ${
                currentImageIndex === 0 ? 'from-orange-400 to-orange-600' :
                currentImageIndex === 1 ? 'from-blue-400 to-blue-600' :
                currentImageIndex === 2 ? 'from-green-400 to-green-600' :
                currentImageIndex === 3 ? 'from-purple-400 to-purple-600' :
                'from-pink-400 to-pink-600'
              }`}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
              
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
                  onClick={() => navigate('/guest/host/krisbernal')}
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  {unit.host}
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
                <div className="font-semibold">₱{unit.price}</div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">TOP AMENITIES</h3>
              <div className="grid grid-cols-2 gap-2">
                {unit.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <span className="text-2xl font-bold text-green-600">₱{unit.price}</span>
                <span className="text-gray-600">/night</span>
              </div>
              <div className="flex space-x-3">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
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

        {/* Booking Policies & Age Restrictions */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Booking Policies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Types */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Booking Options</span>
              </h4>
              <div className="space-y-3">
                {(unit.bookingType === 'fixed' || unit.bookingType === 'both') && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Fixed Time Booking</p>
                      <p className="text-sm text-green-600">₱{unit.price}/night - Standard overnight stays</p>
                    </div>
                  </div>
                )}
                
                {(unit.bookingType === 'hourly' || unit.bookingType === 'both') && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Hourly Booking</p>
                      <p className="text-sm text-blue-600">₱{unit.hourlyRate}/hour - Flexible short-term stays</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Age Restrictions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H16c-.8 0-1.54.37-2 1l-3 4v2h2l2.54-3.4L16.5 16H18v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z"/>
                </svg>
                <span>Age Policy</span>
              </h4>
              <div className="space-y-3">
                {unit.minorsAllowed ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span className="font-medium text-green-800">Minors Allowed</span>
                    </div>
                    <div className="text-sm text-green-600 space-y-1">
                      {unit.minAge > 0 && (
                        <p>• Minimum age: {unit.minAge} years old</p>
                      )}
                      {unit.requiresAdultSupervision && (
                        <p>• Adult supervision required for minors</p>
                      )}
                      <p>• Family-friendly accommodation</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="font-medium text-red-800">Adults Only</span>
                    </div>
                    <p className="text-sm text-red-600">This property is restricted to guests 18+ years old</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Amenities */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">TOP AMENITIES</h3>
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
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Map would be displayed here</span>
              </div>
            </div>

            {/* Availability Calendar */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Check Availability</h4>
              <p className="text-gray-600 text-sm mb-4">Select your check-in and check-out dates</p>
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Booking Policies & Age Restrictions */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Booking Policies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Types */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Booking Options</span>
              </h4>
              <div className="space-y-3">
                {(unit.bookingType === 'fixed' || unit.bookingType === 'both') && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Fixed Time Booking</p>
                      <p className="text-sm text-green-600">₱{unit.price}/night - Standard overnight stays</p>
                    </div>
                  </div>
                )}
                
                {(unit.bookingType === 'hourly' || unit.bookingType === 'both') && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Hourly Booking</p>
                      <p className="text-sm text-blue-600">₱{unit.hourlyRate}/hour - Flexible short-term stays</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Age Restrictions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H16c-.8 0-1.54.37-2 1l-3 4v2h2l2.54-3.4L16.5 16H18v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z"/>
                </svg>
                <span>Age Policy</span>
              </h4>
              <div className="space-y-3">
                {unit.minorsAllowed ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span className="font-medium text-green-800">Minors Allowed</span>
                    </div>
                    <div className="text-sm text-green-600 space-y-1">
                      {unit.minAge > 0 && (
                        <p>• Minimum age: {unit.minAge} years old</p>
                      )}
                      {unit.requiresAdultSupervision && (
                        <p>• Adult supervision required for minors</p>
                      )}
                      <p>• Family-friendly accommodation</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="font-medium text-red-800">Adults Only</span>
                    </div>
                    <p className="text-sm text-red-600">This property is restricted to guests 18+ years old</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* House Rules */}
        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h3>
          <p className="text-red-600">{unit.rules}</p>
        </div>

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button className="text-white p-4 rounded-full shadow-lg hover:opacity-90 flex items-center space-x-2" style={{backgroundColor: '#4E7B22'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chat</span>
          </button>
        </div>
      </div>
    </GuestLayout>
  );
};

export default UnitDetails;