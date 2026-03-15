import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const PaymentPage = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample booking data if not passed from previous page
  const defaultBookingData = {
    unitTitle: 'Luxury Beachfront Condo',
    totalAmount: 2500,
    checkIn: '3/29/2026',
    checkOut: '3/30/2026',
    guests: 1,
    bookingType: 'fixed'
  };

  const booking = bookingData || defaultBookingData;
  const minimumDownpayment = Math.ceil(booking.totalAmount * 0.3); // 30% minimum

  const handlePaymentProofUpload = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 5 * 1024 * 1024) {
      setPaymentProof(file);
    } else {
      alert('Please upload a valid image file (JPG/PNG, max 5MB)');
    }
  };

  const handleSubmitPayment = async () => {
    // Validation
    if (!paymentAmount || parseFloat(paymentAmount) < minimumDownpayment) {
      alert(`Minimum downpayment is ₱${minimumDownpayment}`);
      return;
    }
    if (!referenceNumber.trim()) {
      alert('Please enter the reference number from your payment');
      return;
    }
    if (!paymentProof) {
      alert('Please upload proof of payment');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Payment submitted successfully! Your booking is now confirmed.');
      navigate('/guest/bookings');
    }, 2000);
  };

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-1">Make a downpayment to confirm your booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium">{booking.unitTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{booking.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{booking.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{booking.guests}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-green-600 pt-3 border-t">
                  <span>Total Amount:</span>
                  <span>₱{booking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={paymentMethod === 'gcash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">GCash</span>
                      <p className="text-sm text-gray-600">Scan QR code to pay</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paymaya"
                    disabled
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">P</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">PayMaya</span>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    disabled
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">B</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Bank Transfer</span>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* GCash Payment Section */}
            {paymentMethod === 'gcash' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">GCash Payment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900 mb-4">Scan QR Code</h4>
                    <div className="bg-gray-100 p-6 rounded-lg inline-block">
                      {/* QR Code Placeholder */}
                      <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-32 h-32 bg-black mx-auto mb-2 rounded" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Crect x='10' y='10' width='20' height='20' fill='%23fff'/%3E%3Crect x='70' y='10' width='20' height='20' fill='%23fff'/%3E%3Crect x='10' y='70' width='20' height='20' fill='%23fff'/%3E%3C/svg%3E")`,
                            backgroundSize: 'cover'
                          }}></div>
                          <p className="text-xs text-gray-600">GCash QR Code</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">GCash Number:</p>
                      <p className="text-lg font-bold text-blue-900">09123456789</p>
                      <p className="text-sm text-blue-600">Smart Stay Bookings</p>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Payment Instructions</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                        <p>Open your GCash app and scan the QR code</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                        <p>Enter the payment amount (minimum ₱{minimumDownpayment})</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                        <p>Complete the payment and save the reference number</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                        <p>Fill out the form below with payment details</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800 font-medium">Payment Verification</p>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your payment will be verified within 5-10 minutes. You'll receive a confirmation once approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                      min={minimumDownpayment}
                      max={booking.totalAmount}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Minimum: ₱{minimumDownpayment}</span>
                    <button
                      onClick={() => setPaymentAmount(booking.totalAmount.toString())}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Pay Full Amount
                    </button>
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GCash Reference Number *
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter reference number from GCash"
                  />
                </div>

                {/* Payment Proof Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof of Payment *
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => handlePaymentProofUpload(e.target.files[0])}
                      className="hidden"
                      id="payment-proof"
                    />
                    <label
                      htmlFor="payment-proof"
                      className="cursor-pointer flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Upload Screenshot</span>
                    </label>
                    {paymentProof && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={URL.createObjectURL(paymentProof)}
                          alt="Payment proof"
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <span className="text-sm text-green-600">✓ Uploaded</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a screenshot of your GCash payment confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₱{booking.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Downpayment:</span>
                  <span className="font-medium">₱{minimumDownpayment}</span>
                </div>
                {paymentAmount && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paying Now:</span>
                      <span className="font-semibold">₱{paymentAmount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 border-t pt-3">
                      <span>Remaining Balance:</span>
                      <span className="font-medium">₱{booking.totalAmount - parseFloat(paymentAmount || 0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
              className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{backgroundColor: '#4E7B22'}}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Confirm Payment & Book'
              )}
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              By confirming, you agree to our terms and conditions. Your booking will be confirmed once payment is verified.
            </p>
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
      </div>
    </GuestLayout>
  );
};

export default PaymentPage;