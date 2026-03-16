import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData;
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Sample booking data if not passed from previous page
  const defaultBookingData = {
    unitTitle: 'Luxury Beachfront Condo',
    totalAmount: 2500,
    checkIn: '3/29/2026',
    checkOut: '3/30/2026',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    guests: 2,
    bookingType: 'fixed',
    guestForms: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '09123456789',
        photo: null
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@email.com',
        phone: '09987654321',
        photo: null
      }
    ],
    specialRequests: 'Late check-in preferred, quiet room if possible',
    hasMinors: false,
    minorAges: [],
    priceBreakdown: {
      basePrice: 2000,
      timeSlotFee: 0,
      lateCheckOutFee: 0,
      guestFee: 500,
      total: 2500
    }
  };

  const booking = bookingData || defaultBookingData;
  const minimumDownpayment = Math.ceil(booking.totalAmount * 0.3); // 30% minimum
  const showPaymentSection = paymentMethod === 'gcash'; // Show payment section when GCash is selected

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

    // Show review screen first
    setShowReview(true);
  };

  const handleFinalConfirmation = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create booking confirmation data
      const confirmation = {
        bookingId: 'BK' + Date.now(),
        transactionId: 'TXN' + Date.now(),
        paymentDate: new Date().toLocaleDateString(),
        paymentTime: new Date().toLocaleTimeString(),
        paymentAmount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod.toUpperCase(),
        referenceNumber: referenceNumber,
        remainingBalance: booking.totalAmount - parseFloat(paymentAmount),
        status: 'Confirmed - Pending Payment Verification'
      };
      
      setBookingConfirmation(confirmation);
      setIsSubmitting(false);
      setShowReview(false);
      setShowConfirmation(true);
    }, 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Create receipt content
    const receiptContent = `
SMART STAY BOOKINGS
Booking Confirmation & Receipt

Booking ID: ${bookingConfirmation?.bookingId}
Transaction ID: ${bookingConfirmation?.transactionId}
Date: ${bookingConfirmation?.paymentDate} ${bookingConfirmation?.paymentTime}

PROPERTY DETAILS:
${booking.unitTitle}
Check-in: ${booking.checkIn} at ${booking.checkInTime}
Check-out: ${booking.checkOut} at ${booking.checkOutTime}
Guests: ${booking.guests}

GUEST INFORMATION:
${booking.guestForms?.map((guest, index) => 
  `Guest ${index + 1}: ${guest.firstName} ${guest.lastName}
  Email: ${guest.email}
  Phone: ${guest.phone}`
).join('\n')}

PAYMENT DETAILS:
Payment Method: ${bookingConfirmation?.paymentMethod}
Reference Number: ${bookingConfirmation?.referenceNumber}
Amount Paid: ₱${bookingConfirmation?.paymentAmount}
Remaining Balance: ₱${bookingConfirmation?.remainingBalance}
Status: ${bookingConfirmation?.status}

Thank you for choosing Smart Stay Bookings!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${bookingConfirmation?.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If showing review screen
  if (showReview) {
    return (
      <GuestLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button 
            onClick={() => setShowReview(false)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Payment</span>
          </button>

          {/* Review Header */}
          <div className="text-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Booking</h1>
            <p className="text-gray-600">Please review all details before final confirmation</p>
          </div>

          {/* Review Details */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Booking & Guest Details */}
              <div className="space-y-6">
                {/* Property Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{booking.unitTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{booking.checkIn} at {booking.checkInTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{booking.checkOut} at {booking.checkOutTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{booking.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Type:</span>
                      <span className="font-medium capitalize">{booking.bookingType}</span>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                  <div className="space-y-4">
                    {booking.guestForms?.map((guest, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Guest {index + 1}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span>{guest.firstName} {guest.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{guest.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{guest.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Payment Details */}
              <div className="space-y-6">
                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{paymentMethod.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference Number:</span>
                      <span className="font-medium">{referenceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Amount:</span>
                      <span className="font-medium text-green-600">₱{paymentAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Proof:</span>
                      <span className="font-medium text-green-600">✓ Uploaded</span>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Preview */}
                {paymentProof && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Proof</h3>
                    <div className="border rounded-lg p-3">
                      <img
                        src={URL.createObjectURL(paymentProof)}
                        alt="Payment proof"
                        className="w-full max-w-xs mx-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span>₱{booking.priceBreakdown?.basePrice || booking.totalAmount}</span>
                    </div>
                    {booking.priceBreakdown?.guestFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guest Fee:</span>
                        <span>₱{booking.priceBreakdown.guestFee}</span>
                      </div>
                    )}
                    {booking.priceBreakdown?.timeSlotFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Slot Fee:</span>
                        <span>₱{booking.priceBreakdown.timeSlotFee}</span>
                      </div>
                    )}
                    {booking.priceBreakdown?.lateCheckOutFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late Check-out Fee:</span>
                        <span>₱{booking.priceBreakdown.lateCheckOutFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                      <span>Total Amount:</span>
                      <span>₱{booking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Paying Now:</span>
                      <span>₱{paymentAmount}</span>
                    </div>
                    <div className="flex justify-between text-orange-600 font-semibold">
                      <span>Remaining Balance:</span>
                      <span>₱{booking.totalAmount - parseFloat(paymentAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Please Review Carefully:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Verify all guest information is correct</li>
                <li>• Confirm payment details and reference number</li>
                <li>• Check dates and property details</li>
                <li>• Once confirmed, changes may not be possible</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleFinalConfirmation}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Confirm Booking & Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

  // If showing confirmation screen
  if (showConfirmation && bookingConfirmation) {
    return (
      <GuestLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your payment has been submitted and is being verified</p>
          </div>

          {/* Confirmation Details */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Booking Confirmation</h2>
                <p className="text-gray-600">Booking ID: {bookingConfirmation.bookingId}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrintReceipt}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Details */}
              <div className="space-y-6">
                {/* Property Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium">{booking.unitTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{booking.checkIn} at {booking.checkInTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{booking.checkOut} at {booking.checkOutTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{booking.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Type:</span>
                      <span className="font-medium capitalize">{booking.bookingType}</span>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                  <div className="space-y-4">
                    {booking.guestForms?.map((guest, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Guest {index + 1}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span>{guest.firstName} {guest.lastName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{guest.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{guest.phone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Payment Details */}
              <div className="space-y-6">
                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{bookingConfirmation.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">{bookingConfirmation.paymentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Time:</span>
                      <span className="font-medium">{bookingConfirmation.paymentTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{bookingConfirmation.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference Number:</span>
                      <span className="font-medium">{bookingConfirmation.referenceNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span>₱{booking.priceBreakdown?.basePrice || booking.totalAmount}</span>
                    </div>
                    {booking.priceBreakdown?.guestFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guest Fee:</span>
                        <span>₱{booking.priceBreakdown.guestFee}</span>
                      </div>
                    )}
                    {booking.priceBreakdown?.timeSlotFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Slot Fee:</span>
                        <span>₱{booking.priceBreakdown.timeSlotFee}</span>
                      </div>
                    )}
                    {booking.priceBreakdown?.lateCheckOutFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Late Check-out Fee:</span>
                        <span>₱{booking.priceBreakdown.lateCheckOutFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                      <span>Total Amount:</span>
                      <span>₱{booking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Amount Paid:</span>
                      <span>₱{bookingConfirmation.paymentAmount}</span>
                    </div>
                    <div className="flex justify-between text-orange-600 font-semibold">
                      <span>Remaining Balance:</span>
                      <span>₱{bookingConfirmation.remainingBalance}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Status</h3>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">{bookingConfirmation.status}</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your payment is being verified. You'll receive an email confirmation once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please save this confirmation for your records</li>
                <li>• You will receive an email confirmation once payment is verified</li>
                <li>• Contact us if you need to make any changes to your booking</li>
                <li>• Check-in instructions will be sent 24 hours before your arrival</li>
                {bookingConfirmation.remainingBalance > 0 && (
                  <li>• Remaining balance of ₱{bookingConfirmation.remainingBalance} can be paid upon check-in</li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/guest/booking-history')}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                View Booking History
              </button>
              <button
                onClick={() => navigate('/guest/dashboard')}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

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
            {showPaymentSection && (
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
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Review Summary - Always visible */}
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

            {/* Payment Summary - Only when payment section is visible */}
            {showPaymentSection && (
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
            )}

            {/* Submit Button */}
            {showPaymentSection && (
              <>
                <button
                  onClick={handleSubmitPayment}
                  disabled={isSubmitting}
                  className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{backgroundColor: '#4E7B22'}}
                >
                  Review Booking Details
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  By confirming, you agree to our terms and conditions. Your booking will be confirmed once payment is verified.
                </p>
              </>
            )}
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