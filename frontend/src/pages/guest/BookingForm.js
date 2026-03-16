import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { 
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedCheckOutTime, setSelectedCheckOutTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [bookingType, setBookingType] = useState('fixed');
  const [guests, setGuests] = useState(1);
  
  // Guest information
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photo: null,
    specialRequests: '',
    hasMinors: false
  });

  // Sample unit data
  const unit = {
    id: id,
    title: 'Luxury Beachfront Condo',
    location: '123 Ocean Drive, Miami Beach, FL',
    price: 500
  };

  // Available time slots
  const timeSlots = [
    { time: '12:00 PM', price: 500, available: false },
    { time: '03:00 PM', price: 0, available: true, isStandard: true },
    { time: '04:00 PM', price: 0, available: true },
    { time: '05:00 PM', price: 0, available: true },
    { time: '06:00 PM', price: 0, available: true },
    { time: '07:00 PM', price: 0, available: true },
    { time: '08:00 PM', price: 0, available: true }
  ];

  // Available checkout time slots
  const checkoutTimeSlots = [
    { time: '12:00 PM', price: 500, available: false },
    { time: '03:00 PM', price: 0, available: true, isStandard: true },
    { time: '04:00 PM', price: 0, available: true },
    { time: '05:00 PM', price: 0, available: true },
    { time: '06:00 PM', price: 0, available: true },
    { time: '07:00 PM', price: 0, available: true },
    { time: '08:00 PM', price: 0, available: true }
  ];

  // Duration options
  const durationOptions = [
    { duration: '3 Hours', price: 1500 },
    { duration: '6 Hours', price: 2500 },
    { duration: '12 Hours', price: 4000 },
    { duration: '24 Hours', price: 6500 },
    { duration: '48 Hours', price: 12000 },
    { duration: '72 Hours', price: 18000 }
  ];

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
      } else if ([4, 5, 10, 11, 12, 13, 14, 19, 20, 25, 26, 27].includes(day)) {
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

  const handlePhotoUpload = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 5 * 1024 * 1024) {
      setGuestInfo(prev => ({
        ...prev,
        photo: file
      }));
    } else {
      alert('Please upload a valid image file (JPG/PNG, max 5MB)');
    }
  };

  const handleConfirmBooking = () => {
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
    
    if (!selectedDuration) {
      alert('Please select a duration');
      return;
    }
    
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone) {
      alert('Please fill in all required guest information');
      return;
    }

    // Navigate to payment with booking data
    const bookingData = {
      unitId: id,
      unitTitle: unit.title,
      checkInDate: selectedCheckIn?.toISOString().split('T')[0],
      checkOutDate: selectedCheckOut?.toISOString().split('T')[0],
      selectedTime: selectedTime,
      selectedCheckOutTime: selectedCheckOutTime,
      selectedDuration: selectedDuration,
      bookingType: bookingType,
      guests: guests,
      guestInfo: guestInfo,
      totalAmount: selectedDuration?.price || unit.price
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
                  <li>• Choose the option that best fits your needs</li>
                  <li>• Pricing varies based on selected booking type</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                      <div className="text-gray-600">₱500/night - Standard overnight stays</div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                      <div className="text-gray-600">₱500/night - Standard overnight stays</div>
                    </div>
                  </div>
                </div>
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
                <button
                  onClick={() => handleDurationSelect({ duration: '3 Hours', price: 1500 })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${selectedDuration?.duration === '3 Hours' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                  `}
                >
                  <div className="font-medium">3 Hours</div>
                  <div className="text-sm">₱1,500</div>
                </button>
                <button
                  onClick={() => handleDurationSelect({ duration: '6 Hours', price: 2500 })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${selectedDuration?.duration === '6 Hours' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                  `}
                >
                  <div className="font-medium">6 Hours</div>
                  <div className="text-sm">₱2,500</div>
                </button>
                <button
                  onClick={() => handleDurationSelect({ duration: '12 Hours', price: 4000 })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${selectedDuration?.duration === '12 Hours' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                  `}
                >
                  <div className="font-medium">12 Hours</div>
                  <div className="text-sm">₱4,000</div>
                  <div className="text-xs text-green-600">Standard</div>
                </button>
                <button
                  onClick={() => handleDurationSelect({ duration: '24 Hours', price: 6500 })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${selectedDuration?.duration === '24 Hours' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                  `}
                >
                  <div className="font-medium">24 Hours</div>
                  <div className="text-sm">₱6,500</div>
                </button>
                <button
                  onClick={() => handleDurationSelect({ duration: '48 Hours', price: 12000 })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${selectedDuration?.duration === '48 Hours' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                  `}
                >
                  <div className="font-medium">48 Hours</div>
                  <div className="text-sm">₱12,000</div>
                </button>
                <button
                  onClick={() => handleDurationSelect({ duration: '72 Hours', price: 18000 })}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${selectedDuration?.duration === '72 Hours' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}
                  `}
                >
                  <div className="font-medium">72 Hours</div>
                  <div className="text-sm">₱18,000</div>
                </button>
              </div>
            </div>

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
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
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
                        className="cursor-pointer flex items-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <span className="text-lg">📷</span>
                        <span className="font-medium">Choose Photo</span>
                      </label>
                      {guestInfo.photo && (
                        <span className="text-sm text-green-600">✓ Photo uploaded</span>
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

          {/* Right Column - Booking Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{unit.title}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📍</span>
                    {unit.location}
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
                  {selectedDuration && (
                    <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-4">
                      <span>Total:</span>
                      <span className="text-green-600">₱{selectedDuration.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!selectedCheckIn || !selectedCheckOut || !selectedTime || !selectedCheckOutTime || !selectedDuration || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
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