import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PayMongoPayment from '../../components/payment/PayMongoPayment';
import API_CONFIG from '../../config/api';

const PaymentTest = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [customAmount, setCustomAmount] = useState('1000.00');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data) => {
    setMessage({
      type: 'success',
      text: 'Payment initiated successfully! You will be redirected to PayMongo checkout.'
    });
  };

  const handlePaymentError = (error) => {
    setMessage({
      type: 'error',
      text: `Payment failed: ${error}`
    });
  };

  const getPaymentAmount = () => {
    if (useCustomAmount) {
      return parseFloat(customAmount);
    }
    return selectedBooking ? parseFloat(selectedBooking.totalAmount) : 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to test payments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PayMongo Payment Test</h1>
          <p className="text-gray-600 mb-6">Test the PayMongo integration with GCash and PayMaya</p>

          {/* Test Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Test Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Select a booking or use custom amount</li>
              <li>Choose payment method (GCash or PayMaya)</li>
              <li>Click "Pay" button</li>
              <li>You'll be redirected to PayMongo test checkout</li>
              <li>Complete the test payment flow</li>
              <li>You'll be redirected back to success/failed page</li>
            </ol>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`rounded-lg p-4 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Booking Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Booking</h3>
            
            {loading ? (
              <p className="text-gray-600">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  No bookings found. You can still test with a custom amount below.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <label
                    key={booking.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedBooking?.id === booking.id && !useCustomAmount
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="booking"
                        checked={selectedBooking?.id === booking.id && !useCustomAmount}
                        onChange={() => {
                          setSelectedBooking(booking);
                          setUseCustomAmount(false);
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">Booking #{booking.id}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className="capitalize">{booking.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₱{parseFloat(booking.totalAmount).toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Payment: {booking.paymentStatus || 'pending'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="booking"
                checked={useCustomAmount}
                onChange={() => setUseCustomAmount(true)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900 mb-2">Use Custom Amount</p>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">₱</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onFocus={() => setUseCustomAmount(true)}
                    step="0.01"
                    min="100"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₱100.00 • For testing purposes
                </p>
              </div>
            </label>
          </div>

          {/* Test Credentials Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">🔑 Test Credentials:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>GCash:</strong> Use PayMongo's test checkout (no credentials needed)</p>
              <p><strong>PayMaya:</strong> Use PayMongo's test checkout (no credentials needed)</p>
              <p className="text-xs text-gray-500 mt-2">
                Note: In sandbox mode, you'll see a test checkout page where you can simulate successful or failed payments.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Component */}
        {(selectedBooking || useCustomAmount) && getPaymentAmount() > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <PayMongoPayment
              bookingId={selectedBooking?.id || 999999}
              amount={getPaymentAmount()}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {/* Quick Test Amounts */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">⚡ Quick Test Amounts:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[100, 500, 1000, 5000].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setCustomAmount(amount.toFixed(2));
                  setUseCustomAmount(true);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-colors"
              >
                ₱{amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">🔍 Debug Info:</h3>
          <div className="bg-gray-50 rounded p-4 font-mono text-xs text-gray-700 space-y-1">
            <p><strong>User ID:</strong> {user?.id}</p>
            <p><strong>User Role:</strong> {user?.role}</p>
            <p><strong>Selected Booking:</strong> {selectedBooking?.id || 'None'}</p>
            <p><strong>Payment Amount:</strong> ₱{getPaymentAmount().toFixed(2)}</p>
            <p><strong>API Base URL:</strong> {API_CONFIG.BASE_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;
