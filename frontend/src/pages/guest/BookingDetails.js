import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');

  // Sample booking data - in real app this would come from API
  const booking = {
    id: 'Booking #39',
    reference: 'SS-2026-0039',
    status: 'confirmed',
    statusColor: 'bg-green-100 text-green-800',
    confirmationMessage: 'Instant Booking Confirmed',
    confirmationSubtext: 'This booking was automatically confirmed. You can proceed to payment immediately.',
    unitName: 'ORION',
    location: 'San Agustin, Santo Domingo, Nueva Ecija, Central Luzon, 3133, Philippines',
    hostProfile: 'View Host Profile',
    checkIn: '3/29/2026',
    checkOut: '3/30/2026',
    guests: 1,
    nights: 1,
    unitType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 2,
    totalPrice: '₱1000',
    securityDeposit: '₱1500',
    total: '₱2500',
    paymentStatus: 'paid',
    paymentStatusColor: 'text-green-600'
  };

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/guest/bookings')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to bookings</span>
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Bookings Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Booking Header */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking {booking.id}</h2>
                  <p className="text-gray-600">Reference: <span className="text-blue-600 font-medium">{booking.reference}</span></p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${booking.statusColor}`}>
                  {booking.status}
                </span>
              </div>

              {/* Confirmation Message */}
              <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg mb-2">✓ {booking.confirmationMessage}</h3>
                    <p className="text-green-700">{booking.confirmationSubtext}</p>
                  </div>
                </div>
              </div>

              {/* Unit Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Unit Information</h3>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-gray-900">{booking.unitName}</h4>
                  <div className="flex items-start space-x-3 text-gray-600">
                    <MapPinIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>{booking.location}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/guest/host/krisbernal')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>{booking.hostProfile}</span>
                  </button>
                </div>
              </div>

              {/* Check-in/Check-out Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Check-in</h4>
                  <p className="text-xl font-bold text-gray-900 mb-2">{booking.checkIn}</p>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">Guest</p>
                    <p className="text-lg font-semibold text-gray-900">{booking.guests}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Check-out</h4>
                  <p className="text-xl font-bold text-gray-900 mb-2">{booking.checkOut}</p>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">Night/s</p>
                    <p className="text-lg font-semibold text-gray-900">{booking.nights}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit Details */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Unit Details</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">Types</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.unitType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">Bedrooms</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.bedrooms}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">Bathrooms</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.bathrooms}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">max guests</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.maxGuests}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Actions */}
          <div className="space-y-8">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Price</span>
                  <span className="text-lg font-bold text-gray-900">{booking.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="text-lg font-bold text-gray-900">{booking.securityDeposit}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">{booking.total}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-bold text-lg ${booking.paymentStatusColor}`}>{booking.paymentStatus}</span>
                </div>
              </div>

              {/* Downpayment Section */}
              {booking.paymentStatus !== 'paid' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Make a Payment</h4>
                  <p className="text-blue-600 text-sm mb-4">You can make a partial or full payment now</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Make Payment
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => navigate(`/guest/bookings/${bookingId}/checkout-photos`)}
                  className="w-full bg-green-100 text-green-800 py-4 rounded-lg font-semibold hover:bg-green-200 transition-colors text-lg"
                >
                  Upload Checkout Photos
                </button>
                <button className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
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

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Make Payment</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>Remaining: ₱2500</span>
                      <button
                        onClick={() => setPaymentAmount('2500')}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Pay Full Amount
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="gcash"
                          checked={paymentMethod === 'gcash'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">G</span>
                          </div>
                          <span className="font-medium">GCash</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paymaya"
                          checked={paymentMethod === 'paymaya'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          <span className="font-medium">PayMaya</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">B</span>
                          </div>
                          <span className="font-medium">Bank Transfer</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
                        alert('Please enter a valid payment amount');
                        return;
                      }
                      alert(`Payment of ₱${paymentAmount} via ${paymentMethod.toUpperCase()} processed successfully!`);
                      setShowPaymentModal(false);
                    }}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90"
                    style={{backgroundColor: '#4E7B22'}}
                  >
                    Pay Now
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

export default BookingDetails;