import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import { handleImageFileSelect, uploadImageToCloudinary } from '../../utils/fileUpload';
import { 
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Star, MapPin, Bed, Bath, Users } from 'lucide-react';

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCheckOutTime, setSelectedCheckOutTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [bookingType, setBookingType] = useState('fixed');
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [unavailableDateSet, setUnavailableDateSet] = useState(new Set());

  const formatPHP = (value) => Number(value || 0).toLocaleString('en-PH');
  const nightlyRate = Number(property?.pricePerNight || 0);
  const derivedHourlyRate = Number(property?.hourlyRate || (nightlyRate > 0 ? nightlyRate / 24 : 0));
  const includedGuests = Number(property?.maxGuests || 1);
  const extraGuestFeePerNight = Number(property?.extraGuestFee || property?.timeAvailability?.extraGuestFee || 0);
  const extraGuestCount = Math.max(0, guests - includedGuests);
  const computedNights = selectedCheckIn && selectedCheckOut
    ? Math.max(1, Math.ceil((selectedCheckOut - selectedCheckIn) / (1000 * 60 * 60 * 24)))
    : 1;
  const baseBookingAmount = bookingType === 'hourly'
    ? (selectedDuration?.price || 0)
    : (nightlyRate * computedNights);
  const extraGuestFeeAmount = bookingType === 'fixed'
    ? (extraGuestCount * extraGuestFeePerNight * computedNights)
    : 0;
  const totalBookingPreview = baseBookingAmount + extraGuestFeeAmount;
  const maxSelectableGuests = Math.max(6, includedGuests + 6);
  const guestOptions = Array.from({ length: maxSelectableGuests }, (_, idx) => idx + 1);
  const availableBookingTypes =
    property?.bookingType === 'fixed' || property?.bookingType === 'hourly'
      ? [property.bookingType]
      : ['fixed', 'hourly'];
  const durationHourValues = [3, 6, 12, 24, 48, 72];
  const durationOptions = durationHourValues.map((hours) => ({
    hours,
    duration: `${hours} Hours`,
    price: Math.round(derivedHourlyRate * hours)
  }));
  
  // Guest information
  const [guestInfo, setGuestInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    photo: null,
    photoUrl: null,
    specialRequests: '',
    hasMinors: false
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch property details and existing bookings for date blocking
  useEffect(() => {
    const fetchBookingContext = async () => {
      try {
        setLoadingProperty(true);

        const propertyResponse = await axios.get(`${apiBaseUrl}/properties/${id}`);
        setProperty(propertyResponse.data);

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const bookingsResponse = await axios.get(`${apiBaseUrl}/bookings`, {
          params: { propertyId: id },
          headers,
          withCredentials: true
        });

        const blocked = new Set();
        (bookingsResponse.data?.bookings || [])
          .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
          .forEach((booking) => {
            const start = new Date(booking.checkIn);
            const end = new Date(booking.checkOut);
            const cursor = new Date(start);

            while (cursor < end) {
              blocked.add(cursor.toISOString().split('T')[0]);
              cursor.setDate(cursor.getDate() + 1);
            }
          });

        setUnavailableDateSet(blocked);
      } catch (err) {
        console.error('Error fetching booking context:', err);
      } finally {
        setLoadingProperty(false);
      }
    };

    if (id) {
      fetchBookingContext();
    }
  }, [id, apiBaseUrl, token]);

  useEffect(() => {
    if (!property?.bookingType) return;

    if (property.bookingType === 'fixed' || property.bookingType === 'hourly') {
      setBookingType(property.bookingType);
    }
  }, [property?.bookingType]);

  // Convert time string (HH:MM) to 12-hour format
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Generate available time slots based on property's time availability
  const getPropertyTimeSlots = () => {
    if (!property?.timeAvailability) {
      // Fallback to default times if not available
      return [
        { time: '03:00 PM', timeValue: '15:00', price: 0, available: true, isStandard: true },
        { time: '04:00 PM', timeValue: '16:00', price: 0, available: true },
        { time: '05:00 PM', timeValue: '17:00', price: 0, available: true }
      ];
    }

    const checkInTime = formatTime(property.timeAvailability.checkInTime);
    return [
      { 
        time: checkInTime, 
        timeValue: property.timeAvailability.checkInTime,
        price: 0, 
        available: true, 
        isStandard: true 
      }
    ];
  };

  // Generate checkout time slots based on property's time availability
  const getPropertyCheckoutSlots = () => {
    if (!property?.timeAvailability) {
      // Fallback to default times if not available
      return [
        { time: '11:00 AM', timeValue: '11:00', price: 0, available: true, isStandard: true }
      ];
    }

    const checkOutTime = formatTime(property.timeAvailability.checkOutTime);
    return [
      { 
        time: checkOutTime, 
        timeValue: property.timeAvailability.checkOutTime,
        price: 0, 
        available: true, 
        isStandard: true 
      }
    ];
  };

  // Available time slots
  const timeSlots = getPropertyTimeSlots();

  // Available checkout time slots
  const checkoutTimeSlots = getPropertyCheckoutSlots();

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let status = 'available';
      if (currentDate < today) {
        status = 'past';
      } else if (unavailableDateSet.has(currentDate.toISOString().split('T')[0])) {
        status = 'unavailable';
      } else if (selectedCheckIn && currentDate.toDateString() === selectedCheckIn.toDateString()) {
        status = 'selected';
      } else if (selectedCheckOut && currentDate.toDateString() === selectedCheckOut.toDateString()) {
        status = 'selected';
      }
      
      days.push({
        date: currentDate,
        day: day,
        status: status
      });
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateClick = (dayObj) => {
    if (!dayObj || dayObj.status === 'past' || dayObj.status === 'unavailable') return;
    
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Select check-in date
      setSelectedCheckIn(dayObj.date);
      setSelectedCheckOut(null);
    } else if (selectedCheckIn && !selectedCheckOut) {
      // Select check-out date
      if (dayObj.date > selectedCheckIn) {
        setSelectedCheckOut(dayObj.date);
      } else {
        setSelectedCheckIn(dayObj.date);
        setSelectedCheckOut(null);
      }
    }
  };

  const handleTimeSelect = (timeSlot) => {
    if (timeSlot.available) {
      setSelectedTime(timeSlot);
    }
  };

  const handleCheckOutTimeSelect = (timeSlot) => {
    if (timeSlot.available) {
      setSelectedCheckOutTime(timeSlot);
    }
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  const handleInputChange = (field, value) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    try {
      const didStart = handleImageFileSelect({ target: { files: [file] } }, async (fileData) => {
        try {
          setUploadingPhoto(true);
          const imageUrl = await uploadImageToCloudinary(fileData.file);
          
          setGuestInfo(prev => ({
            ...prev,
            photo: file,
            photoUrl: imageUrl
          }));
        } catch (error) {
          console.error('Error uploading photo:', error);
          alert('Failed to upload photo. Please try again.');
        } finally {
          setUploadingPhoto(false);
        }
      });

      if (!didStart) {
        alert('Please upload a valid image file (JPG/PNG, max 5MB)');
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      alert('Failed to process photo. Please try again.');
    }
  };

  const handleConfirmBooking = async () => {
    // Validation
    if (!selectedCheckIn || !selectedCheckOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    if (!selectedTime) {
      alert('Please select a check-in time');
      return;
    }
    
    if (!selectedCheckOutTime) {
      alert('Please select a check-out time');
      return;
    }
    
    if (bookingType === 'hourly' && !selectedDuration) {
      alert('Please select a duration');
      return;
    }

    if (bookingType === 'hourly' && guests > includedGuests) {
      alert(`Hourly booking supports up to ${includedGuests} guests for this unit`);
      return;
    }

    if (bookingType === 'fixed' && guests > includedGuests && extraGuestFeePerNight <= 0) {
      alert(`This unit supports up to ${includedGuests} guests`);
      return;
    }
    
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      alert('Please fill in all required guest information');
      return;
    }

    // Calculate total amount
    const nights = Math.max(1, Math.ceil((selectedCheckOut - selectedCheckIn) / (1000 * 60 * 60 * 24)));
    const baseAmount = bookingType === 'hourly'
      ? (selectedDuration?.price || 0)
      : (nightlyRate * nights);
    const extraFeeAmount = bookingType === 'fixed'
      ? (Math.max(0, guests - includedGuests) * extraGuestFeePerNight * nights)
      : 0;
    const totalAmount = baseAmount + extraFeeAmount;

    // Navigate to payment page with booking data (NO booking created yet)
    const bookingData = {
      propertyId: parseInt(id),
      propertyTitle: property?.title,
      propertyHostId: property?.hostId,
      checkInDate: selectedCheckIn?.toISOString().split('T')[0],
      checkOutDate: selectedCheckOut?.toISOString().split('T')[0],
      checkIn: selectedCheckIn.toISOString(),
      checkOut: selectedCheckOut.toISOString(),
      selectedTime: selectedTime,
      selectedCheckOutTime: selectedCheckOutTime,
      selectedDuration: selectedDuration,
      bookingType: bookingType,
      guests: guests,
      guestInfo: guestInfo,
      totalAmount: totalAmount,
      metadata: {
        selectedDuration,
        durationHours: selectedDuration?.hours || null,
        extraGuestCount: Math.max(0, guests - includedGuests),
        extraGuestFeePerNight,
        extraGuestFeeTotal: extraFeeAmount,
        includedGuests,
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phone: guestInfo.phone,
        photoUrl: guestInfo.photoUrl,
        minors: guestInfo.hasMinors
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes expiration
    };

    navigate(`/guest/units/${id}/payment`, { 
      state: { bookingData } 
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <GuestLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Process */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Stay</h1>
              <p className="text-gray-600">Book your stay in one of the best units</p>
            </div>

            {/* Select Your Dates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Dates</h2>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h3 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {getDaysInMonth(currentMonth).map((dayObj, index) => (
                  <button
                    key={index}
                    onClick={() => dayObj && handleDateClick(dayObj)}
                    disabled={!dayObj || dayObj.status === 'past'}
                    className={`
                      p-3 text-sm rounded-lg transition-colors min-h-[48px] flex items-center justify-center
                      ${!dayObj ? 'invisible' : ''}
                      ${dayObj?.status === 'past' ? 'text-gray-300 cursor-not-allowed' : ''}
                      ${dayObj?.status === 'available' ? 'bg-yellow-100 hover:bg-yellow-200 text-gray-900' : ''}
                      ${dayObj?.status === 'unavailable' ? 'bg-red-200 text-red-800 cursor-not-allowed' : ''}
                      ${dayObj?.status === 'selected' ? 'bg-green-400 text-white' : ''}
                    `}
                  >
                    {dayObj?.day}
                  </button>
                ))}
              </div>

              {/* Check-in/Check-out Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">Check In</div>
                  <div className="font-medium text-gray-900">
                    {selectedCheckIn ? selectedCheckIn.toLocaleDateString() : 'Select Date'}
                  </div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">Check Out</div>
                  <div className="font-medium text-gray-900">
                    {selectedCheckOut ? selectedCheckOut.toLocaleDateString() : 'Select Date'}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* Booking Type */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Type</h2>
              
              {/* Booking Type Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Booking Type Information</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Fixed Time: Standard check-in/out times with overnight stays</li>
                  <li>• Hourly: Flexible duration-based bookings for shorter stays</li>
                  <li>
                    • {availableBookingTypes.length === 1
                      ? `This unit only allows ${availableBookingTypes[0]} booking.`
                      : 'Choose the option that best fits your needs'}
                  </li>
                  <li>• Pricing varies based on selected booking type</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                {availableBookingTypes.includes('fixed') && (
                <div 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    bookingType === 'fixed' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setBookingType('fixed')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      bookingType === 'fixed' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📅</span>
                        <span className="font-semibold text-lg">Fixed Time Booking</span>
                      </div>
                      <div className="text-gray-600">₱{formatPHP(nightlyRate)}/night - Standard overnight stays</div>
                    </div>
                  </div>
                </div>
                )}

                {availableBookingTypes.includes('hourly') && (
                <div 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    bookingType === 'hourly' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setBookingType('hourly')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      bookingType === 'hourly' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">⏰</span>
                        <span className="font-semibold text-lg">Hourly Booking</span>
                      </div>
                      <div className="text-gray-600">₱{formatPHP(derivedHourlyRate)}/hour - Flexible short-term stays</div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Select Check-in Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Check-in Time</h2>
              
              {/* Fixed Time Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Fixed Time Information</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Standard Check-in: 3:00 PM</li>
                  <li>• Standard Check-out: 11:00 AM</li>
                  <li>• Early Check-in available from 12:00 PM (+₱500)</li>
                  <li>• Late Check-out available until 2:00 PM (+₱300)</li>
                </ul>
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!slot.available}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${!slot.available ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed' : ''}
                      ${slot.available && selectedTime?.time === slot.time ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                      ${slot.isStandard ? 'text-green-600' : ''}
                    `}
                  >
                    <div className="font-medium">{slot.time}</div>
                    {slot.price > 0 && <div className="text-sm">+₱{slot.price}</div>}
                    {slot.isStandard && <div className="text-xs text-green-600">Standard</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Check-out Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Check-out Time</h2>
              
              {/* Fixed Time Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Fixed Time Information</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Standard Check-in: 3:00 PM</li>
                  <li>• Standard Check-out: 11:00 AM</li>
                  <li>• Early Check-in available from 12:00 PM (+₱500)</li>
                  <li>• Late Check-out available until 2:00 PM (+₱300)</li>
                </ul>
              </div>

              {/* Check-out Time Slots */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {checkoutTimeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleCheckOutTimeSelect(slot)}
                    disabled={!slot.available}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${!slot.available ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed' : ''}
                      ${slot.available && selectedCheckOutTime?.time === slot.time ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                      ${slot.isStandard ? 'text-green-600' : ''}
                    `}
                  >
                    <div className="font-medium">{slot.time}</div>
                    {slot.price > 0 && <div className="text-sm">+₱{slot.price}</div>}
                    {slot.isStandard && <div className="text-xs text-green-600">Standard</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Time */}
            {bookingType === 'hourly' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Time</h2>
              
              {/* Duration Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Duration Information</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Short stays: 3-6 hours perfect for day use</li>
                  <li>• Standard duration: 12 hours recommended</li>
                  <li>• Extended stays: 24+ hours for overnight experience</li>
                  <li>• Flexible pricing based on duration selected</li>
                </ul>
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {durationOptions.map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => handleDurationSelect(option)}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${selectedDuration?.hours === option.hours ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                    `}
                  >
                    <div className="font-medium">{option.duration}</div>
                    <div className="text-sm">₱{formatPHP(option.price)}</div>
                    {option.hours === 12 && <div className="text-xs text-green-600">Standard</div>}
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Guest Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <UserIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Guest Information</h2>
              </div>

              {/* Guest Information Box */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Guest Information Requirements</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• All fields marked with * are required for booking</li>
                  <li>• Profile photo is required for identity verification</li>
                  <li>• Primary contact will receive all booking confirmations</li>
                  <li>• Special requests will be reviewed by the host</li>
                </ul>
              </div>

              {/* Number of Guests */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {guestOptions.map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-600">
                  Included guests: {includedGuests}. Extra guest fee: ₱{formatPHP(extraGuestFeePerNight)} per person/night.
                </p>
                {extraGuestCount > 0 && bookingType === 'fixed' && extraGuestFeePerNight > 0 && (
                  <p className="mt-1 text-sm text-orange-700">
                    {extraGuestCount} extra guest{extraGuestCount > 1 ? 's' : ''} x ₱{formatPHP(extraGuestFeePerNight)} x {computedNights} night{computedNights > 1 ? 's' : ''} = +₱{formatPHP(extraGuestFeeAmount)}
                  </p>
                )}
                {extraGuestCount > 0 && bookingType === 'hourly' && (
                  <p className="mt-1 text-sm text-red-600">
                    Hourly booking is limited to {includedGuests} guest{includedGuests > 1 ? 's' : ''} for this unit.
                  </p>
                )}
              </div>

                {/* Guest 1 (Primary Contact) */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest 1 (Primary Contact)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guestInfo.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Owen"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guestInfo.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Knight"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter Email Address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter Phone Number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo <span className="text-red-500">*</span> Required for Verification
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handlePhotoUpload(e.target.files[0])}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer flex items-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">📷</span>
                        <span className="font-medium">{uploadingPhoto ? 'Uploading...' : 'Choose Photo'}</span>
                      </label>
                      {guestInfo.photoUrl && (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={guestInfo.photoUrl} 
                            alt="Profile preview" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                          />
                          <span className="text-sm text-green-600">✓ Photo uploaded</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a clear photo for identity verification (JPG/PNG, max 5MB)
                    </p>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests (optional)</h3>
                  <textarea
                    value={guestInfo.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or requirements ..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Minor Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Minor Information</h3>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={guestInfo.hasMinors}
                      onChange={(e) => handleInputChange('hasMinors', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-green-700">I will be bringing minor(s) (under 18 years old)</span>
                  </label>
                </div>
              </div>
            </div>

          {/* Right Column - Property Details & Booking Summary */}
          <div className="space-y-6">
            {/* Property Details Card */}
            {loadingProperty ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ) : property ? (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
                {/* Property Image */}
                <img
                  src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                
                {/* Property Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  
                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {property.address.city}, {property.address.state}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(property.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {property.rating} ({property.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="text-center">
                      <Bed className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                      <span className="text-sm text-gray-600">{property.bedrooms} Beds</span>
                    </div>
                    <div className="text-center">
                      <Bath className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                      <span className="text-sm text-gray-600">{property.bathrooms} Baths</span>
                    </div>
                    <div className="text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                      <span className="text-sm text-gray-600">{property.maxGuests} Guests</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities?.slice(0, 5).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities?.length > 5 && (
                        <span className="inline-block text-gray-500 text-xs px-3 py-1">
                          +{property.amenities.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      ₱{property.pricePerNight.toLocaleString()}
                      <span className="text-sm font-normal text-gray-600"> /night</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Booking Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{property?.title || 'Property'}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📍</span>
                    {property ? `${property.address.city}, ${property.address.state}` : 'Loading...'}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {selectedCheckIn ? selectedCheckIn.toLocaleDateString() : 'Not Selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {selectedCheckOut ? selectedCheckOut.toLocaleDateString() : 'Not Selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in Time:</span>
                    <span className="font-medium">
                      {selectedTime ? selectedTime.time : 'Not Selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out Time:</span>
                    <span className="font-medium">
                      {selectedCheckOutTime ? selectedCheckOutTime.time : 'Not Selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {selectedDuration ? selectedDuration.duration : 'Not Selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Type:</span>
                    <span className="font-medium capitalize">{bookingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-medium">₱{formatPHP(baseBookingAmount)}</span>
                  </div>
                  {bookingType === 'fixed' && extraGuestFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra Guest Fee:</span>
                      <span className="font-medium">+₱{formatPHP(extraGuestFeeAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-4">
                    <span>Total:</span>
                    <span className="text-green-600">₱{formatPHP(totalBookingPreview)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={
                  !selectedCheckIn
                  || !selectedCheckOut
                  || !selectedTime
                  || !selectedCheckOutTime
                  || (bookingType === 'hourly' && !selectedDuration)
                  || !guestInfo.firstName
                  || !guestInfo.lastName
                  || !guestInfo.email
                  || !guestInfo.phone
                  || loadingProperty
                }
                className="w-full text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: '#4E7B22'}}
              >
                Continue to Payment
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By clicking "Confirm Booking", you agree to our{' '}
                <span className="text-green-600 underline cursor-pointer">terms and conditions</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default BookingForm;