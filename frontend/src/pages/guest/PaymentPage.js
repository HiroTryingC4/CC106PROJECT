import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';
import PayMongoPayment from '../../components/payment/PayMongoPayment';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, loading: authLoading } = useAuth();
  const bookingData = location.state?.bookingData;
  const apiBaseUrl = API_CONFIG.BASE_URL;
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paymongo-gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [pageError, setPageError] = useState('');
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [paymentLockReason, setPaymentLockReason] = useState(null);
  const [showPayMongoReview, setShowPayMongoReview] = useState(false);
  const [showPayMongoPayment, setShowPayMongoPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', name: '', cvc: '' });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null); // { id, code, discountAmount, finalAmount, description }
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const booking = useMemo(() => {
    if (!bookingData) {
      return null;
    }

    const totalAmount = Number(bookingData.totalAmount || 0);
    return {
      unitTitle: bookingData.propertyTitle || 'Property',
      totalAmount,
      checkIn: bookingData.checkInDate || '',
      checkOut: bookingData.checkOutDate || '',
      checkInTime: bookingData.selectedTime?.time || 'Not Selected',
      checkOutTime: bookingData.selectedCheckOutTime?.time || 'Not Selected',
      guests: bookingData.guests || 1,
      bookingType: bookingData.bookingType || 'fixed',
      specialRequests: bookingData.guestInfo?.specialRequests || '',
      hasMinors: bookingData.guestInfo?.hasMinors || false,
      guestForms: bookingData.guestInfo
        ? [{
          firstName: bookingData.guestInfo.firstName,
          lastName: bookingData.guestInfo.lastName,
          email: bookingData.guestInfo.email,
          phone: bookingData.guestInfo.phone
        }]
        : [],
      priceBreakdown: {
        basePrice: totalAmount,
        timeSlotFee: 0,
        lateCheckOutFee: 0,
        guestFee: 0,
        total: totalAmount
      },
      expiresAt: bookingData.expiresAt
    };
  }, [bookingData]);

  useEffect(() => {
    if (!booking?.expiresAt) return;

    const checkExpiration = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(booking.expiresAt).getTime();
      const remaining = expiresAt - now;

      if (remaining <= 0) {
        setSessionExpired(true);
        setTimeRemaining(null);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [booking?.expiresAt]);

  useEffect(() => {
    const fetchRemainingBalance = async () => {
      if (!booking) {
        return;
      }

      // For new flow, remaining balance is the full amount
      setRemainingBalance(Number(booking.totalAmount || 0));
      setLoadingBalance(false);
    };

    fetchRemainingBalance();
  }, [booking]);

  if (!booking) {
    return (
      <GuestLayout>
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            No booking data found. Please start from the booking form.
          </div>
          <button
            onClick={() => navigate('/guest/properties')}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#4E7B22' }}
          >
            Browse Properties
          </button>
        </div>
      </GuestLayout>
    );
  }

  if (sessionExpired) {
    return (
      <GuestLayout>
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Session Expired</h3>
            <p>Your booking session has expired. Please start the booking process again to reserve your dates.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#4E7B22' }}
          >
            Start New Booking
          </button>
        </div>
      </GuestLayout>
    );
  }

  if (remainingBalance !== null && remainingBalance <= 0) {
    const isPendingLock = paymentLockReason === 'pending';
    return (
      <GuestLayout>
        <div className="max-w-3xl mx-auto p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {isPendingLock
              ? 'A payment for this booking is already pending confirmation.'
              : 'This booking has already been fully paid.'}
          </div>
          <button
            onClick={() => navigate('/guest/bookings')}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#4E7B22' }}
          >
            {isPendingLock ? 'Back to Booking Details' : 'Go to Booking History'}
          </button>
        </div>
      </GuestLayout>
    );
  }

  const effectiveRemainingBalance = promoResult
    ? promoResult.finalAmount
    : (remainingBalance ?? Number(booking.totalAmount || 0));
  const baseBalance = remainingBalance ?? Number(booking.totalAmount || 0);
  const showPaymentSection = paymentMethod === 'gcash-manual';

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoResult(null);
    try {
      const res = await fetch(`${apiBaseUrl}/promo-codes/validate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ code: promoCode.trim(), bookingAmount: baseBalance, propertyId: bookingData.propertyId })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.message || 'Invalid promo code');
      } else {
        setPromoResult(data.data);
      }
    } catch {
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoResult(null);
    setPromoCode('');
    setPromoError('');
  };

  const isPayMongoMethod = paymentMethod === 'paymongo-gcash' || paymentMethod === 'paymongo-paymaya' || paymentMethod === 'paymongo-card';

  const handlePayMongoSuccess = async (data) => {
    try {
      setIsSubmitting(true);
      const paidAmount = Number(data?.amount ?? paymentAmount ?? 0);
      
      // Map backend payment method to frontend display name
      let methodLabel;
      if (data?.paymentMethod) {
        const method = String(data.paymentMethod).toLowerCase();
        if (method === 'gcash') {
          methodLabel = 'PAYMONGO GCASH';
        } else if (method === 'grab_pay' || method === 'paymaya') {
          methodLabel = 'PAYMONGO MAYA';
        } else if (method === 'card') {
          methodLabel = 'PAYMONGO CARD';
        } else {
          methodLabel = String(data.paymentMethod).toUpperCase();
        }
      } else {
        methodLabel = paymentMethod === 'paymongo-gcash'
          ? 'PAYMONGO GCASH'
          : paymentMethod === 'paymongo-paymaya'
            ? 'PAYMONGO MAYA'
            : 'PAYMONGO CARD';
      }

      // Create booking with payment
      const bookingPayload = {
        propertyId: bookingData.propertyId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        checkInTime: bookingData.selectedTime?.timeValue || '',
        checkOutTime: bookingData.selectedCheckOutTime?.timeValue || '',
        bookingType: bookingData.bookingType,
        guests: bookingData.guests,
        specialRequests: bookingData.guestInfo?.specialRequests || '',
        metadata: {
          ...(bookingData.metadata || {}),
          email: bookingData.guestInfo?.email,
          firstName: bookingData.guestInfo?.firstName,
          lastName: bookingData.guestInfo?.lastName,
          phone: bookingData.guestInfo?.phone
        },
        promoCodeId: promoResult?.id || undefined,
        payment: {
          amount: paidAmount,
          paymentMethod: data?.paymentMethod || (paymentMethod === 'paymongo-gcash' ? 'gcash' : paymentMethod === 'paymongo-paymaya' ? 'paymaya' : 'card'),
          transactionId: data?.paymentIntentId || data?.sourceId || data?.paymentMethodId || '',
          referenceNumber: data?.paymentIntentId || data?.sourceId || data?.paymentMethodId || '',
          status: data?.status === 'succeeded' || data?.status === 'chargeable' ? 'completed' : 'pending',
          metadata: {
            paymentIntentId: data?.paymentIntentId,
            sourceId: data?.sourceId,
            paymentMethodId: data?.paymentMethodId,
            paymentMethod: data?.paymentMethod
          }
        }
      };

      const response = await axios.post(`${apiBaseUrl}/bookings/with-payment`, bookingPayload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });

      if (response.data?.booking) {
        const confirmation = {
          bookingId: response.data.booking.id,
          transactionId: data?.paymentIntentId || data?.sourceId || data?.paymentMethodId || `PM-${response.data.booking.id}`,
          paymentDate: new Date().toLocaleDateString(),
          paymentTime: new Date().toLocaleTimeString(),
          paymentAmount: paidAmount,
          paymentMethod: methodLabel,
          referenceNumber: data?.paymentIntentId || data?.sourceId || data?.paymentMethodId || '',
          remainingBalance: Number(response.data.remainingBalance || 0),
          status: data?.status === 'succeeded' || data?.status === 'chargeable' ? 'Confirmed - Payment Received' : 'Payment Submitted',
          promoCode: response.data.booking.metadata?.promoCode || null,
          discountAmount: response.data.booking.metadata?.discountAmount || 0
        };

        setBookingConfirmation(confirmation);
        setShowPayMongoReview(false);
        setShowPayMongoPayment(false);
        setShowReview(false);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error creating booking with payment:', error);
      const message = error.response?.data?.message || 'Failed to create booking. Please try again.';
      setPageError(message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayMongoError = (error) => {
    setPageError(error);
    alert(`Payment error: ${error}`);
  };

  const handlePaymentProofUpload = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png') && file.size <= 5 * 1024 * 1024) {
      setPaymentProof(file);
    } else {
      alert('Please upload a valid image file (JPG/PNG, max 5MB)');
    }
  };

  const handleSubmitPayment = async () => {
    // Validation
    if (effectiveRemainingBalance <= 0) {
      alert(
        paymentLockReason === 'pending'
          ? 'A payment for this booking is already pending confirmation.'
          : 'This booking has already been fully paid.'
      );
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) < effectiveRemainingBalance) {
      alert(`Payment amount must be ₱${effectiveRemainingBalance.toLocaleString('en-PH')}`);
      return;
    }
    if (parseFloat(paymentAmount) > effectiveRemainingBalance) {
      alert(`Payment cannot exceed the remaining balance of ₱${effectiveRemainingBalance.toLocaleString('en-PH')}`);
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
    if (!token && !user) {
      alert('Please log in to continue with payment');
      return;
    }

    if (sessionExpired) {
      alert('Your session has expired. Please start the booking process again.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create booking with payment
      const bookingPayload = {
        propertyId: bookingData.propertyId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        checkInTime: bookingData.selectedTime?.timeValue || '',
        checkOutTime: bookingData.selectedCheckOutTime?.timeValue || '',
        bookingType: bookingData.bookingType,
        guests: bookingData.guests,
        specialRequests: bookingData.guestInfo?.specialRequests || '',
        metadata: bookingData.metadata,
        promoCodeId: promoResult?.id || undefined,
        payment: {
          amount: parseFloat(paymentAmount),
          paymentMethod: paymentMethod === 'gcash-manual' ? 'gcash' : 'bank_transfer',
          transactionId: referenceNumber,
          referenceNumber: referenceNumber,
          status: 'pending',
          metadata: {
            manualPayment: true,
            paymentProof: paymentProof ? 'uploaded' : 'none'
          }
        }
      };

      const response = await axios.post(`${apiBaseUrl}/bookings/with-payment`, bookingPayload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true
      });

      if (response.data?.booking) {
        // Create booking confirmation data
        const confirmation = {
          bookingId: response.data.booking.id,
          transactionId: response.data.payment.id || referenceNumber,
          paymentDate: new Date().toLocaleDateString(),
          paymentTime: new Date().toLocaleTimeString(),
          paymentAmount: parseFloat(paymentAmount),
          paymentMethod: paymentMethod.toUpperCase(),
          referenceNumber: referenceNumber,
          remainingBalance: Number(response.data.remainingBalance || 0),
          status: 'Confirmed - Payment Received',
          promoCode: response.data.booking.metadata?.promoCode || null,
          discountAmount: response.data.booking.metadata?.discountAmount || 0
        };
        
        setBookingConfirmation(confirmation);
        setShowReview(false);
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      const message = err.response?.data?.message || 'Failed to process payment. Please try again.';
      setPageError(message);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
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

  // If showing PayMongo review screen
  if (showPayMongoReview && isPayMongoMethod) {
    return (
      <GuestLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <button 
            onClick={() => setShowPayMongoReview(false)}
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
                      <span className="font-medium">
                        {paymentMethod === 'paymongo-gcash'
                          ? 'PayMongo GCash'
                          : paymentMethod === 'paymongo-paymaya'
                            ? 'PayMongo Maya'
                            : 'PayMongo Credit/Debit Card'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Amount:</span>
                      <span className="font-medium text-green-600">₱{effectiveRemainingBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

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
                      <span>Subtotal:</span>
                      <span>₱{booking.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {promoResult && (
                      <div className="flex justify-between text-red-600 text-sm">
                        <span>Promo ({promoResult.code}):</span>
                        <span>-₱{promoResult.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Paying Now (Full):</span>
                      <span>₱{effectiveRemainingBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <li>• Confirm payment details and amount</li>
                <li>• Check dates and property details</li>
                <li>• You will be redirected to PayMongo to complete payment</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowPayMongoReview(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={async () => {
                  if (authLoading) {
                    alert('Authentication is still loading. Please wait a moment and try again.');
                    return;
                  }
                  if (paymentMethod === 'paymongo-card') {
                    if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.name || !cardDetails.cvc) {
                      alert('Please complete all card details');
                      return;
                    }
                  }
                  setIsSubmitting(true);
                  try {
                    const bookingDataToStore = {
                      propertyId: bookingData.propertyId,
                      checkIn: bookingData.checkIn,
                      checkOut: bookingData.checkOut,
                      checkInTime: bookingData.selectedTime?.timeValue || '',
                      checkOutTime: bookingData.selectedCheckOutTime?.timeValue || '',
                      bookingType: bookingData.bookingType,
                      guests: bookingData.guests,
                      specialRequests: bookingData.guestInfo?.specialRequests || '',
                      guestInfo: {
                        email: bookingData.guestInfo?.email,
                        firstName: bookingData.guestInfo?.firstName,
                        lastName: bookingData.guestInfo?.lastName,
                        phone: bookingData.guestInfo?.phone
                      },
                      metadata: bookingData.metadata,
                      promoCodeId: promoResult?.id || null
                    };
                    
                    // Store booking data in database and get pendingId
                    const pendingResponse = await axios.post(
                      `${apiBaseUrl}/pending-bookings`,
                      { bookingData: bookingDataToStore },
                      {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        withCredentials: true
                      }
                    );
                    
                    const { pendingId } = pendingResponse.data;
                    console.log('Stored pending booking:', pendingId);
                    
                    // Call PayMongo API
                    const endpoint = paymentMethod === 'paymongo-card'
                      ? `${apiBaseUrl}/payments/create-card-payment`
                      : `${apiBaseUrl}/payments/create-source`;

                    const billing = {
                      name: `${bookingData.guestInfo?.firstName || ''} ${bookingData.guestInfo?.lastName || ''}`.trim() || 'Guest User',
                      email: bookingData.guestInfo?.email || 'guest@smartstay.com',
                      phone: bookingData.guestInfo?.phone || '09123456789'
                    };

                    const requestBody = paymentMethod === 'paymongo-card'
                      ? {
                          bookingId: 999999,
                          amount: effectiveRemainingBalance,
                          cardNumber: cardDetails.cardNumber.replace(/\D/g, ''),
                          expMonth: cardDetails.expiry.split('/')[0],
                          expYear: '20' + cardDetails.expiry.split('/')[1],
                          cvc: cardDetails.cvc,
                          billing,
                          metadata: { pendingId }
                        }
                      : {
                          bookingId: 999999,
                          amount: effectiveRemainingBalance,
                          paymentMethod: paymentMethod === 'paymongo-gcash' ? 'gcash' : 'paymaya',
                          billing,
                          metadata: { pendingId }
                        };

                    const response = await fetch(endpoint, {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(requestBody)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.message || 'Payment failed');
                    }

                    console.log('PayMongo response:', data);

                    // Card payments complete immediately, no redirect needed
                    if (data.status === 'succeeded') {
                      await handlePayMongoSuccess({
                        paymentIntentId: data.paymentIntentId,
                        paymentMethodId: data.paymentMethodId,
                        amount: data.amount,
                        status: data.status,
                        paymentMethod: 'card'
                      });
                    } else if (data.checkoutUrl) {
                      window.location.href = data.checkoutUrl;
                    } else if (data.nextActionUrl) {
                      window.location.href = data.nextActionUrl;
                    } else {
                      throw new Error('No checkout URL received');
                    }
                  } catch (error) {
                    console.error('Payment error:', error);
                    alert(`Payment failed: ${error.message}`);
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting || authLoading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Loading...' : isSubmitting ? (
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
                      <span>Subtotal:</span>
                      <span>₱{booking.totalAmount}</span>
                    </div>
                    {promoResult && (
                      <div className="flex justify-between text-red-600 text-sm">
                        <span>Promo ({promoResult.code}):</span>
                        <span>-₱{promoResult.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
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
                      <span>Subtotal:</span>
                      <span>₱{booking.totalAmount}</span>
                    </div>
                    {bookingConfirmation.promoCode && (
                      <div className="flex justify-between text-red-600 text-sm">
                        <span>Promo ({bookingConfirmation.promoCode}):</span>
                        <span>-₱{Number(bookingConfirmation.discountAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
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
        {pageError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {pageError}
          </div>
        )}
        
        {/* Session Timer Warning */}
        {timeRemaining && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Complete payment within:</span>
              </div>
              <span className="text-2xl font-bold text-yellow-900">{timeRemaining}</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              Your booking reservation will expire if payment is not completed in time.
            </p>
          </div>
        )}

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
          <p className="text-gray-600 mt-1">Secure your booking with payment</p>
          <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your booking will be created once payment is confirmed</li>
              <li>• Full payment is required to secure your reservation</li>
              <li>• You'll receive email confirmation after successful payment</li>
            </ul>
          </div>
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
                {/* PayMongo GCash Option */}
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'paymongo-gcash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paymongo-gcash"
                    checked={paymentMethod === 'paymongo-gcash'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setShowPayMongoReview(false);
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">PayMongo GCash</span>
                      <p className="text-sm text-gray-600">Fast & secure mobile wallet payment</p>
                    </div>
                  </div>
                </label>

                                    {/* PayMongo Maya (GrabPay) Option */}
                                    <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      paymentMethod === 'paymongo-paymaya' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                                    }`}>
                                      <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="paymongo-paymaya"
                                        checked={paymentMethod === 'paymongo-paymaya'}
                                        onChange={(e) => {
                                          setPaymentMethod(e.target.value);
                                          setShowPayMongoReview(false);
                                        }}
                                        className="text-green-600 focus:ring-green-500"
                                      />
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                          <span className="text-white font-bold text-xs">M</span>
                                        </div>
                                        <div>
                                          <span className="font-semibold text-gray-900">PayMongo Maya</span>
                                          <p className="text-sm text-gray-600">Digital wallet payment</p>
                                        </div>
                                      </div>
                                    </label>

                {/* PayMongo Card Option */}
                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'paymongo-card' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paymongo-card"
                    checked={paymentMethod === 'paymongo-card'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setShowPayMongoReview(false);
                    }}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">CC</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">PayMongo Credit / Debit Card</span>
                      <p className="text-sm text-gray-600">Visa, Mastercard, and more</p>
                    </div>
                  </div>
                </label>
                
                {/* Manual GCash Option */}
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash-manual"
                    checked={paymentMethod === 'gcash-manual'}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setShowPayMongoReview(false);
                    }}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">G</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">GCash (Manual - QR Code)</span>
                      <p className="text-sm text-gray-600">Scan QR code & upload proof</p>
                    </div>
                  </div>
                </label>
              </div>
              {isPayMongoMethod && !showPayMongoReview && (
                <div className="mt-4 space-y-4">
                  {paymentMethod === 'paymongo-card' && (
                    <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <h4 className="font-semibold text-gray-900">Card Details</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                          placeholder="1234 5678 9012 3456"
                          inputMode="numeric"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry *</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                              setCardDetails(prev => ({ ...prev, expiry: val }));
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="MM/YY"
                            inputMode="numeric"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVC *</label>
                          <input
                            type="text"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                            placeholder="123"
                            inputMode="numeric"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card *</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                          placeholder="Juan Dela Cruz"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (paymentMethod === 'paymongo-card') {
                        if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.name || !cardDetails.cvc) {
                          alert('Please complete all card details');
                          return;
                        }
                      }
                      setShowPayMongoReview(true);
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Review Booking Details
                  </button>
                </div>
              )}
            </div>

            {/* PayMongo Review Step */}
            {isPayMongoMethod && showPayMongoReview && !showPayMongoPayment && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Review</h3>

                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Next step</p>
                    <p>
                      Click the button below to review your complete booking details before proceeding to PayMongo payment.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPayMongoReview(true)}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Review Booking Details
                  </button>
                </div>
              </div>
            )}

            {/* PayMongo Payment Component */}
            {isPayMongoMethod && showPayMongoPayment && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowPayMongoPayment(false);
                      setShowPayMongoReview(true);
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to Review</span>
                  </button>
                </div>
                <PayMongoPayment
                  bookingId={999999}
                  amount={effectiveRemainingBalance}
                  selectedMethod={
                    paymentMethod === 'paymongo-gcash'
                      ? 'gcash'
                      : paymentMethod === 'paymongo-paymaya'
                        ? 'paymaya'
                        : 'card'
                  }
                  minAmount={effectiveRemainingBalance}
                  maxAmount={effectiveRemainingBalance}
                  onSuccess={handlePayMongoSuccess}
                  onError={handlePayMongoError}
                />
              </div>
            )}

            {/* GCash Payment Section */}
            {paymentMethod === 'gcash-manual' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                
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
                        <p>Enter the exact payment amount: ₱{effectiveRemainingBalance.toLocaleString('en-PH')}</p>
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
                        min={effectiveRemainingBalance}
                        max={effectiveRemainingBalance}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Amount Due: ₱{effectiveRemainingBalance.toLocaleString('en-PH')}</span>
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
            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Promo Code</h3>
              {promoResult ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">{promoResult.code} applied!</p>
                      <p className="text-sm text-green-700">-₱{promoResult.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <button onClick={handleRemovePromo} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Original:</span>
                      <span>₱{baseBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-₱{promoResult.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-700 border-t pt-1">
                      <span>Total to Pay:</span>
                      <span>₱{promoResult.finalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && <p className="text-sm text-red-600">{promoError}</p>}
                </div>
              )}
            </div>

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
                {promoResult && (
                  <>
                    <div className="flex justify-between text-red-600 text-sm">
                      <span>Discount ({promoResult.code}):</span>
                      <span>-₱{promoResult.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-700">
                      <span>You Pay:</span>
                      <span>₱{promoResult.finalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
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
                    <span className="text-gray-600">Amount Due:</span>
                    <span className="font-medium">₱{effectiveRemainingBalance.toLocaleString('en-PH')}</span>
                  </div>
                  {paymentAmount && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Paying Now:</span>
                        <span className="font-semibold">₱{paymentAmount}</span>
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
      </div>
    </GuestLayout>
  );
};

export default PaymentPage;