import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null });
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCheckOutTime, setSelectedCheckOutTime] = useState('');
  const [bookingType, setBookingType] = useState('fixed'); // 'fixed' or 'hourly'
  const [hourlyDuration, setHourlyDuration] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    guests: 1,
    guestForms: [{ firstName: '', lastName: '', email: '', phone: '', photo: null }],
    specialRequests: '',
    hasMinors: false,
    minorAges: []
  });
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2)); // March 2026
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sample unit data
  const unit = {
    id: 1,
    title: 'Luxury Beachfront Condo',
    type: 'CONDO',
    price: 5000,
    hourlyRate: 500,
    maxGuests: 4,
    location: '123 Ocean Drive, Miami Beach, FL',
    bookingType: 'both', // 'fixed', 'hourly', or 'both'
    minorsAllowed: true,
    minAge: 0,
    requiresAdultSupervision: true,
    // Host fixed time settings
    fixedTimeSettings: {
      checkInTime: '15:00', // 3:00 PM
      checkOutTime: '11:00', // 11:00 AM
      allowEarlyCheckIn: true,
      allowLateCheckOut: true,
      earlyCheckInFee: 500, // Additional fee for early check-in
      lateCheckOutFee: 500, // Additional fee for late check-out
      earlyCheckInTime: '12:00', // Earliest check-in time
      lateCheckOutTime: '14:00' // Latest check-out time
    }
  };

  const getAvailableTimeSlots = () => {
    if (bookingType === 'fixed') {
      // For fixed bookings, show standard check-in times and early check-in options
      const slots = [];
      
      // Early check-in options (if allowed)
      if (unit.fixedTimeSettings.allowEarlyCheckIn) {
        const earlyTime = unit.fixedTimeSettings.earlyCheckInTime;
        slots.push({
          time: earlyTime,
          label: `${formatTime(earlyTime)} (Early Check-in +₱${unit.fixedTimeSettings.earlyCheckInFee})`,
          isEarly: true,
          fee: unit.fixedTimeSettings.earlyCheckInFee
        });
      }
      
      // Standard check-in time
      const standardTime = unit.fixedTimeSettings.checkInTime;
      slots.push({
        time: standardTime,
        label: formatTime(standardTime),
        isStandard: true,
        fee: 0
      });
      
      // Later check-in options
      const laterTimes = ['16:00', '17:00', '18:00', '19:00', '20:00'];
      laterTimes.forEach(time => {
        slots.push({
          time: time,
          label: formatTime(time),
          isLate: true,
          fee: 0
        });
      });
      
      return slots;
    } else {
      // For hourly bookings, show all available hours
      const slots = [];
      for (let hour = 9; hour <= 20; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push({
          time: time,
          label: formatTime(time),
          fee: 0
        });
      }
      return slots;
    }
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getSelectedTimeSlot = () => {
    const slots = getAvailableTimeSlots();
    return slots.find(slot => slot.time === selectedTime);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!selectedDates.checkIn || isSelectingCheckOut) {
      if (!selectedDates.checkIn) {
        setSelectedDates({ checkIn: clickedDate, checkOut: null });
        setIsSelectingCheckOut(true);
      } else {
        if (clickedDate > selectedDates.checkIn) {
          setSelectedDates(prev => ({ ...prev, checkOut: clickedDate }));
          setIsSelectingCheckOut(false);
        } else {
          setSelectedDates({ checkIn: clickedDate, checkOut: null });
        }
      }
    } else {
      setSelectedDates({ checkIn: clickedDate, checkOut: null });
      setIsSelectingCheckOut(true);
    }
  };

  const isDateInRange = (day) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date >= selectedDates.checkIn && date <= selectedDates.checkOut;
  };

  const isDateSelected = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return (selectedDates.checkIn && date.getTime() === selectedDates.checkIn.getTime()) ||
           (selectedDates.checkOut && date.getTime() === selectedDates.checkOut.getTime());
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);
      const isAvailable = day >= 15; // Sample availability logic

      let dayClass = 'h-12 w-12 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors ';
      
      if (isSelected) {
        dayClass += 'bg-green-600 text-white font-semibold';
      } else if (isInRange) {
        dayClass += 'bg-green-100 text-green-800';
      } else if (isAvailable) {
        dayClass += 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200';
      } else {
        dayClass += 'bg-red-100 text-red-400 cursor-not-allowed';
      }

      days.push(
        <div 
          key={day} 
          className={dayClass}
          onClick={() => isAvailable && handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const calculateNights = () => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const timeDiff = selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    let total = 0;
    let breakdown = {
      basePrice: 0,
      timeSlotFee: 0,
      lateCheckOutFee: 0,
      guestFee: 0,
      total: 0
    };

    if (bookingType === 'hourly') {
      breakdown.basePrice = hourlyDuration * unit.hourlyRate;
    } else {
      const nights = calculateNights();
      breakdown.basePrice = nights * unit.price;
      
      // Add time slot fees (early check-in)
      const timeSlot = getSelectedTimeSlot();
      if (timeSlot && timeSlot.fee > 0) {
        breakdown.timeSlotFee = timeSlot.fee;
      }
      
      // Add late check-out fee
      if (selectedCheckOutTime && selectedCheckOutTime !== unit.fixedTimeSettings.checkOutTime) {
        breakdown.lateCheckOutFee = unit.fixedTimeSettings.lateCheckOutFee;
      }
    }

    // Additional guest fee (if more than 2 guests)
    if (guestInfo.guests > 2) {
      const extraGuests = guestInfo.guests - 2;
      breakdown.guestFee = extraGuests * 200; // ₱200 per extra guest
    }

    breakdown.total = breakdown.basePrice + breakdown.timeSlotFee + breakdown.lateCheckOutFee + breakdown.guestFee;
    
    return breakdown;
  };

  const getPriceBreakdown = () => {
    return calculateTotal();
  };

  const handleInputChange = (field, value) => {
    if (field === 'guests') {
      const numGuests = parseInt(value);
      const currentForms = guestInfo.guestForms;
      
      if (numGuests > currentForms.length) {
        // Add new guest forms
        const newForms = [...currentForms];
        for (let i = currentForms.length; i < numGuests; i++) {
          newForms.push({ firstName: '', lastName: '', email: '', phone: '', photo: null });
        }
        setGuestInfo(prev => ({ ...prev, guests: numGuests, guestForms: newForms }));
      } else if (numGuests < currentForms.length) {
        // Remove excess guest forms
        const newForms = currentForms.slice(0, numGuests);
        setGuestInfo(prev => ({ ...prev, guests: numGuests, guestForms: newForms }));
      } else {
        setGuestInfo(prev => ({ ...prev, guests: numGuests }));
      }
    } else {
      setGuestInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleGuestFormChange = (guestIndex, field, value) => {
    const updatedForms = [...guestInfo.guestForms];
    updatedForms[guestIndex] = { ...updatedForms[guestIndex], [field]: value };
    setGuestInfo(prev => ({ ...prev, guestForms: updatedForms }));
  };

  const handlePhotoUpload = (guestIndex, file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 5 * 1024 * 1024) {
      handleGuestFormChange(guestIndex, 'photo', file);
    } else {
      alert('Please upload a valid image file (JPG/PNG, max 5MB)');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (bookingType === 'fixed') {
      if (!selectedDates.checkIn || !selectedDates.checkOut) {
        alert('Please select check-in and check-out dates');
        return;
      }
    } else if (bookingType === 'hourly') {
      if (!selectedDates.checkIn) {
        alert('Please select a date for your hourly booking');
        return;
      }
      if (hourlyDuration < 1) {
        alert('Please select a valid duration');
        return;
      }
    }
    
    if (!selectedTime) {
      alert('Please select a check-in time');
      return;
    }

    // Validate all guest forms
    for (let i = 0; i < guestInfo.guestForms.length; i++) {
      const guest = guestInfo.guestForms[i];
      if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
        alert(`Please fill in all required information for Guest ${i + 1}`);
        return;
      }
      if (!guest.photo) {
        alert(`Please upload a photo for Guest ${i + 1}`);
        return;
      }
    }

    // Minor validation
    if (unit.minorsAllowed && guestInfo.hasMinors) {
      if (guestInfo.minorAges.length === 0) {
        alert('Please specify the ages of minors in your group');
        return;
      }
      if (unit.minAge > 0) {
        const hasUnderageMinor = guestInfo.minorAges.some(age => parseInt(age) < unit.minAge);
        if (hasUnderageMinor) {
          alert(`This property requires all guests to be at least ${unit.minAge} years old`);
          return;
        }
      }
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmBooking = () => {
    // Prepare booking data to pass to payment page
    const breakdown = getPriceBreakdown();
    const bookingData = {
      unitTitle: unit.title,
      totalAmount: breakdown.total,
      priceBreakdown: breakdown,
      checkIn: selectedDates.checkIn ? formatDate(selectedDates.checkIn) : null,
      checkOut: selectedDates.checkOut ? formatDate(selectedDates.checkOut) : null,
      checkInTime: selectedTime,
      checkOutTime: selectedCheckOutTime || unit.fixedTimeSettings.checkOutTime,
      guests: guestInfo.guests,
      bookingType: bookingType,
      hourlyDuration: bookingType === 'hourly' ? hourlyDuration : null,
      guestForms: guestInfo.guestForms,
      specialRequests: guestInfo.specialRequests,
      hasMinors: guestInfo.hasMinors,
      minorAges: guestInfo.minorAges
    };

    // Navigate to payment page with booking data
    setShowConfirmModal(false);
    navigate(`/guest/units/${id}/payment`, { state: { bookingData } });
  };

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/guest/units/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to unit details</span>
        </button>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Your Stay</h1>
          <p className="text-gray-600 mt-1">{unit.title}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Calendar and Time */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Select Your Dates</h3>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <button 
                      type="button"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h4 className="text-xl font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendar()}
                  </div>
                </div>

                {/* Selected Dates Display */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Check-in</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedDates.checkIn ? formatDate(selectedDates.checkIn) : 'Select date'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Check-out</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedDates.checkOut ? formatDate(selectedDates.checkOut) : 'Select date'}
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                    <span className="text-sm text-gray-600">Unavailable</span>
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bookingType === 'fixed' ? 'Select Check-in Time' : 'Select Start Time'}
                  </h3>
                </div>
                
                {bookingType === 'fixed' && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Fixed Time Information</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Standard Check-in: {formatTime(unit.fixedTimeSettings.checkInTime)}</p>
                      <p>• Standard Check-out: {formatTime(unit.fixedTimeSettings.checkOutTime)}</p>
                      {unit.fixedTimeSettings.allowEarlyCheckIn && (
                        <p>• Early Check-in available from {formatTime(unit.fixedTimeSettings.earlyCheckInTime)} (+₱{unit.fixedTimeSettings.earlyCheckInFee})</p>
                      )}
                      {unit.fixedTimeSettings.allowLateCheckOut && (
                        <p>• Late Check-out available until {formatTime(unit.fixedTimeSettings.lateCheckOutTime)} (+₱{unit.fixedTimeSettings.lateCheckOutFee})</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getAvailableTimeSlots().map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedTime === slot.time
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${slot.isEarly ? 'border-orange-300 bg-orange-50' : ''}`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{slot.label.split(' (')[0]}</div>
                        {slot.fee > 0 && (
                          <div className="text-xs text-orange-600 mt-1">+₱{slot.fee}</div>
                        )}
                        {slot.isStandard && (
                          <div className="text-xs text-green-600 mt-1">Standard</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedTime && bookingType === 'fixed' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">
                      <strong>Selected Time:</strong> {formatTime(selectedTime)}
                      {getSelectedTimeSlot()?.fee > 0 && (
                        <span className="text-orange-600 ml-2">(Additional fee: ₱{getSelectedTimeSlot().fee})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Check-out time: {formatTime(unit.fixedTimeSettings.checkOutTime)} (next day)
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Time Selection (for fixed bookings) */}
              {bookingType === 'fixed' && selectedDates.checkOut && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Select Check-out Time</h3>
                  </div>
                  
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Standard check-out time is {formatTime(unit.fixedTimeSettings.checkOutTime)}. 
                      {unit.fixedTimeSettings.allowLateCheckOut && (
                        <span> Late check-out available until {formatTime(unit.fixedTimeSettings.lateCheckOutTime)} for an additional fee.</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Standard checkout time */}
                    <button
                      type="button"
                      onClick={() => setSelectedCheckOutTime(unit.fixedTimeSettings.checkOutTime)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedCheckOutTime === unit.fixedTimeSettings.checkOutTime
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{formatTime(unit.fixedTimeSettings.checkOutTime)}</div>
                        <div className="text-xs text-green-600 mt-1">Standard</div>
                      </div>
                    </button>
                    
                    {/* Late checkout options */}
                    {unit.fixedTimeSettings.allowLateCheckOut && ['12:00', '13:00', '14:00'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedCheckOutTime(time)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          selectedCheckOutTime === time
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        } border-orange-300 bg-orange-50`}
                      >
                        <div className="text-center">
                          <div className="font-medium">{formatTime(time)}</div>
                          <div className="text-xs text-orange-600 mt-1">+₱{unit.fixedTimeSettings.lateCheckOutFee}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedCheckOutTime && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700">
                        <strong>Check-out Time:</strong> {formatTime(selectedCheckOutTime)}
                        {selectedCheckOutTime !== unit.fixedTimeSettings.checkOutTime && (
                          <span className="text-orange-600 ml-2">(Late checkout fee: ₱{unit.fixedTimeSettings.lateCheckOutFee})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {(unit.bookingType === 'both' || unit.bookingType === 'hourly') && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Type</h3>
                  
                  <div className="space-y-3">
                    {(unit.bookingType === 'fixed' || unit.bookingType === 'both') && (
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="bookingType"
                          value="fixed"
                          checked={bookingType === 'fixed'}
                          onChange={(e) => setBookingType(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            <span className="font-medium text-gray-900">Fixed Time Booking</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">₱{unit.price}/night - Standard overnight stays</p>
                        </div>
                      </label>
                    )}
                    
                    {(unit.bookingType === 'hourly' || unit.bookingType === 'both') && (
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="bookingType"
                          value="hourly"
                          checked={bookingType === 'hourly'}
                          onChange={(e) => setBookingType(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                            </svg>
                            <span className="font-medium text-gray-900">Hourly Booking</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">₱{unit.hourlyRate}/hour - Flexible short-term stays</p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Hourly Duration Selection */}
                  {bookingType === 'hourly' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (hours)
                      </label>
                      <select
                        value={hourlyDuration}
                        onChange={(e) => setHourlyDuration(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} hour{i + 1 > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <UserIcon className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
                </div>
                
                {/* Number of Guests */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={guestInfo.guests}
                    onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {[...Array(unit.maxGuests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Guest Forms */}
                <div className="space-y-6">
                  {guestInfo.guestForms.map((guest, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Guest {index + 1} {index === 0 && '(Primary Contact)'}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={guest.firstName}
                            onChange={(e) => handleGuestFormChange(index, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter first name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={guest.lastName}
                            onChange={(e) => handleGuestFormChange(index, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter last name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={guest.email}
                            onChange={(e) => handleGuestFormChange(index, 'email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter email address"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={guest.phone}
                            onChange={(e) => handleGuestFormChange(index, 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter phone number"
                          />
                        </div>
                        
                        {/* Photo Upload */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Photo * (Required for verification)
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              onChange={(e) => handlePhotoUpload(index, e.target.files[0])}
                              className="hidden"
                              id={`photo-${index}`}
                            />
                            <label
                              htmlFor={`photo-${index}`}
                              className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">Choose Photo</span>
                            </label>
                            {guest.photo && (
                              <div className="flex items-center space-x-2">
                                <img
                                  src={URL.createObjectURL(guest.photo)}
                                  alt={`Guest ${index + 1}`}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <span className="text-sm text-green-600">✓ Uploaded</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload a clear photo for identity verification (JPG/PNG, max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={guestInfo.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                {/* Minor Information */}
                {unit.minorsAllowed && (
                  <div className="mt-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 7H16c-.8 0-1.54.37-2 1l-3 4v2h2l2.54-3.4L16.5 16H18v6h2zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z"/>
                        </svg>
                        <span className="font-medium text-green-800">Minor Information</span>
                      </div>
                      
                      <label className="flex items-center space-x-2 mb-3">
                        <input
                          type="checkbox"
                          checked={guestInfo.hasMinors}
                          onChange={(e) => handleInputChange('hasMinors', e.target.checked)}
                          className="text-green-600 focus:ring-green-500 rounded"
                        />
                        <span className="text-sm text-green-700">
                          I will be bringing minor(s) (under 18 years old)
                        </span>
                      </label>

                      {guestInfo.hasMinors && (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600 mb-2">
                            Please specify the ages of minors in your group:
                          </p>
                          <textarea
                            value={guestInfo.minorAges.join(', ')}
                            onChange={(e) => handleInputChange('minorAges', e.target.value.split(',').map(age => age.trim()).filter(age => age))}
                            rows={2}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            placeholder="e.g., 12, 15, 8"
                          />
                          {unit.requiresAdultSupervision && (
                            <p className="text-xs text-green-600">
                              * Adult supervision is required for all minors
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="space-y-6">
              {/* Unit Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{unit.title}</h4>
                    <p className="text-sm text-gray-600">{unit.location}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">
                        {selectedDates.checkIn ? formatDate(selectedDates.checkIn) : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">
                        {selectedDates.checkOut ? formatDate(selectedDates.checkOut) : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{guestInfo.guests}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Booking Type:</span>
                      <span className="font-medium capitalize">{bookingType}</span>
                    </div>
                  </div>
                  
                  {(calculateNights() > 0 || (bookingType === 'hourly' && hourlyDuration > 0)) && (
                    <div className="border-t pt-4">
                      {(() => {
                        const breakdown = getPriceBreakdown();
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {bookingType === 'hourly' 
                                  ? `₱${unit.hourlyRate} × ${hourlyDuration} hour${hourlyDuration > 1 ? 's' : ''}`
                                  : `₱${unit.price} × ${calculateNights()} night${calculateNights() > 1 ? 's' : ''}`
                                }
                              </span>
                              <span className="font-medium">₱{breakdown.basePrice}</span>
                            </div>
                            
                            {breakdown.timeSlotFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Early Check-in Fee</span>
                                <span className="font-medium">₱{breakdown.timeSlotFee}</span>
                              </div>
                            )}
                            
                            {breakdown.lateCheckOutFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Late Check-out Fee</span>
                                <span className="font-medium">₱{breakdown.lateCheckOutFee}</span>
                              </div>
                            )}
                            
                            {breakdown.guestFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Extra Guest Fee ({guestInfo.guests - 2} guests)</span>
                                <span className="font-medium">₱{breakdown.guestFee}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-lg font-semibold text-green-600 pt-2 border-t">
                              <span>Total</span>
                              <span>₱{breakdown.total}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{backgroundColor: '#4E7B22'}}
              >
                Confirm Booking
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                By clicking "Confirm Booking", you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button className="text-white p-4 rounded-full shadow-lg hover:opacity-90 flex items-center space-x-2" style={{backgroundColor: '#4E7B22'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chat</span>
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Property:</span>
                        <p className="font-medium">{unit.title}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Booking Type:</span>
                        <p className="font-medium capitalize">{bookingType}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Check-in:</span>
                        <p className="font-medium">
                          {selectedDates.checkIn ? formatDate(selectedDates.checkIn) : 'Not selected'} at {selectedTime ? formatTime(selectedTime) : 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {bookingType === 'hourly' ? 'Duration:' : 'Check-out:'}
                        </span>
                        <p className="font-medium">
                          {bookingType === 'hourly' 
                            ? `${hourlyDuration} hour${hourlyDuration > 1 ? 's' : ''}`
                            : selectedDates.checkOut 
                              ? `${formatDate(selectedDates.checkOut)} at ${selectedCheckOutTime ? formatTime(selectedCheckOutTime) : formatTime(unit.fixedTimeSettings.checkOutTime)}`
                              : 'Not selected'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Guests:</span>
                        <p className="font-medium">{guestInfo.guests}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <p className="font-medium text-green-600">₱{getPriceBreakdown().total}</p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Guest Information</h3>
                    <div className="space-y-3">
                      {guestInfo.guestForms.map((guest, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          {guest.photo && (
                            <img
                              src={URL.createObjectURL(guest.photo)}
                              alt={`Guest ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {guest.firstName} {guest.lastName}
                              {index === 0 && ' (Primary Contact)'}
                            </p>
                            <p className="text-sm text-gray-600">{guest.email}</p>
                            <p className="text-sm text-gray-600">{guest.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {guestInfo.specialRequests && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{guestInfo.specialRequests}</p>
                    </div>
                  )}

                  {/* Minor Information */}
                  {guestInfo.hasMinors && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Minor Information</h3>
                      <p className="text-gray-600 bg-green-50 p-3 rounded-lg">
                        Minors in group: {guestInfo.minorAges.join(', ')} years old
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Review & Edit
                  </button>
                  <button
                    onClick={confirmBooking}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90"
                    style={{backgroundColor: '#4E7B22'}}
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
};

export default BookingForm;