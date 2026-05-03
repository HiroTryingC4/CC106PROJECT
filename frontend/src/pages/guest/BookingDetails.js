import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reviewSectionRef = useRef(null);
  const apiBaseUrl = API_CONFIG.BASE_URL;
  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationInfo, setCancellationInfo] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cancellationResult, setCancellationResult] = useState(null);
  const [cancellationNotice, setCancellationNotice] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [resolvedPaymentStatus, setResolvedPaymentStatus] = useState('pending');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const bookingResponse = await fetch(`${apiBaseUrl}/bookings/${bookingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });

        if (!bookingResponse.ok) {
          throw new Error('Failed to load booking details');
        }

        const bookingData = await bookingResponse.json();
        setBooking(bookingData);

        const propertyResponse = await fetch(`${apiBaseUrl}/properties/${bookingData.propertyId}`, {
          credentials: 'include'
        });

        if (propertyResponse.ok) {
          const propertyData = await propertyResponse.json();
          setProperty(propertyData);
        }

        const paymentsResponse = await fetch(
          `${apiBaseUrl}/payments?bookingId=${bookingData.id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            credentials: 'include'
          }
        );

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          const payments = paymentsData?.payments || [];

          const totalAmount = Number(bookingData.totalAmount || 0);
          const pendingAmount = payments.reduce(
            (sum, payment) => (payment.status === 'pending' ? sum + Number(payment.amount || 0) : sum),
            0
          );
          const completedAmount = payments.reduce(
            (sum, payment) => (payment.status === 'completed' ? sum + Number(payment.amount || 0) : sum),
            0
          );

          const reservedAmount = pendingAmount + completedAmount;
          const nextRemainingBalance = Math.max(0, totalAmount - reservedAmount);
          setRemainingBalance(nextRemainingBalance);

          if (nextRemainingBalance <= 0) {
            if (completedAmount >= totalAmount) {
              setResolvedPaymentStatus('paid');
            } else if (pendingAmount > 0) {
              setResolvedPaymentStatus('pending_confirmation');
            } else {
              setResolvedPaymentStatus('paid');
            }
          } else if (reservedAmount > 0) {
            setResolvedPaymentStatus('partial');
          } else {
            setResolvedPaymentStatus(bookingData.paymentStatus || 'pending');
          }
        } else {
          setResolvedPaymentStatus(bookingData.paymentStatus || 'pending');
          setRemainingBalance(Number(bookingData.totalAmount || 0));
        }

        // Fetch review for this booking
        try {
          const reviewsResponse = await fetch(
            `${apiBaseUrl}/reviews?bookingId=${bookingData.id}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              credentials: 'include'
            }
          );

          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            const reviews = reviewsData?.reviews || [];
            if (reviews.length > 0) {
              setReview(reviews[0]); // Get first review for this booking
            }
          }
        } catch (reviewError) {
          console.error('Error fetching review:', reviewError);
          // Don't fail if review fetch fails
        }

        setError('');
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, apiBaseUrl]);

  // Scroll to review section if requested via URL parameter
  useEffect(() => {
    const scrollToReview = searchParams.get('scrollTo') === 'review';
    
    if (scrollToReview && reviewSectionRef.current) {
      // Wait for DOM to be fully rendered
      const timer = setTimeout(() => {
        reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [review, searchParams, loading]);

  const nights = useMemo(() => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const oneDayMs = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil((checkOut - checkIn) / oneDayMs));
  }, [booking]);

  const statusColor = (status) => {
    if (status === 'confirmed') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'completed') return 'bg-blue-100 text-blue-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const paymentStatusColor = (status) => {
    if (status === 'paid') return 'text-green-600';
    if (status === 'partial') return 'text-yellow-600';
    if (status === 'pending_confirmation') return 'text-blue-600';
    if (status === 'refunded') return 'text-purple-600';
    if (status === 'failed') return 'text-red-600';
    return 'text-gray-600';
  };

  const paymentStatusLabel = (status) => {
    if (status === 'pending_confirmation') return 'pending confirmation';
    return status;
  };

  const formatDate = (value) => new Date(value).toLocaleDateString('en-PH');
  const formatAmount = (value) => `₱${Number(value || 0).toLocaleString('en-PH')}`;

  const showCancellationNotice = (title, message) => {
    setCancellationNotice({ title, message });
  };

  const handleCancelBooking = async () => {
    if (!booking || booking.status === 'cancelled') return;

    try {
      // Fetch cancellation policy from backend
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/bookings/${booking.id}/cancellation-policy`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cancellation policy');
      }

      const policyData = await response.json();

      if (!policyData.canCancel) {
        showCancellationNotice('Cannot Cancel Booking', policyData.reason || 'Cannot cancel this booking');
        return;
      }

      setCancellationInfo(policyData);
      setShowCancelModal(true);
    } catch (err) {
      console.error('Error fetching cancellation policy:', err);
      showCancellationNotice('Unable to Cancel Booking', 'Unable to fetch cancellation policy');
    }
  };

  const confirmCancellation = async () => {
    setShowCancelModal(false);

    try {
      setCancelling(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/bookings/${booking.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cancel booking error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      
      // Update booking with cancelled status and refunded payment status
      const updatedBooking = {
        ...booking,
        status: data.booking.status,
        paymentStatus: data.booking.paymentStatus,
        metadata: data.booking.metadata
      };
      setBooking(updatedBooking);
      
      // Store cancellation result and show success modal
      setCancellationResult(data.cancellation);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showCancellationNotice('Cancellation Failed', err.message || 'Unable to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <GuestLayout>
        <div className="p-6 text-gray-600">Loading booking details...</div>
      </GuestLayout>
    );
  }

  if (error || !booking) {
    return (
      <GuestLayout>
        <div className="p-6 space-y-4">
          <button onClick={() => navigate('/guest/bookings')} className="text-gray-600 hover:text-gray-800">Back to bookings</button>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error || 'Booking not found'}</div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Notice Modal */}
        {cancellationNotice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5">
              <div className="bg-gradient-to-r from-[#4E7B22] to-[#6a962f] px-6 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">Booking Update</p>
                <h3 className="mt-1 text-2xl font-semibold">{cancellationNotice.title}</h3>
              </div>
              <div className="px-6 py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-7.2 12.44A2 2 0 004.81 19h14.38a2 2 0 001.72-2.7l-7.2-12.44a2 2 0 00-3.44 0z" />
                  </svg>
                </div>
                <p className="text-sm leading-6 text-gray-600">{cancellationNotice.message}</p>
                <button
                  onClick={() => setCancellationNotice(null)}
                  className="mt-6 w-full rounded-2xl bg-[#4E7B22] px-4 py-3 font-medium text-white shadow-lg shadow-[#4E7B22]/20 transition hover:opacity-95"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && cancellationResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h3>
                <p className="text-gray-600">Your booking has been successfully cancelled</p>
              </div>

              {cancellationResult.refundAmount > 0 ? (
                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">Refund Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Policy:</span>
                        <span className="font-medium text-gray-900">{cancellationResult.policy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Paid:</span>
                        <span className="font-medium text-gray-900">{formatAmount(cancellationResult.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Refund Percentage:</span>
                        <span className="font-medium text-green-600">{cancellationResult.refundPercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-200">
                        <span className="text-gray-900 font-semibold">Refund Amount:</span>
                        <span className="font-bold text-green-600 text-lg">{formatAmount(cancellationResult.refundAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    The refund will be processed within 5-7 business days
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm text-center">
                    No refund applicable based on the cancellation policy
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCancellationResult(null);
                }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && cancellationInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Booking?</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Cancellation Policy</h4>
                  <p className="text-blue-800 text-sm">{cancellationInfo.policy}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hours until check-in:</span>
                    <span className="font-semibold text-gray-900">{cancellationInfo.hoursUntilCheckIn}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total paid:</span>
                    <span className="font-semibold text-gray-900">{formatAmount(cancellationInfo.totalPaid || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Refund percentage:</span>
                    <span className="font-semibold text-green-600">{cancellationInfo.refundPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-900 font-semibold">Refund amount:</span>
                    <span className="font-bold text-green-600 text-lg">{formatAmount(cancellationInfo.refundAmount || 0)}</span>
                  </div>
                </div>

                {cancellationInfo.refundPercentage === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm font-medium">
                      ⚠️ No refund will be issued for this cancellation
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancellation}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking #{booking.id}</h2>
                  <p className="text-gray-600">Reference: <span className="text-blue-600 font-medium">SS-{String(booking.id).padStart(6, '0')}</span></p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              {/* Confirmation Message */}
              <div className={`border-l-4 p-6 mb-8 ${
                booking.status === 'cancelled' 
                  ? 'bg-red-50 border-red-400' 
                  : 'bg-green-50 border-green-400'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    booking.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {booking.status === 'cancelled' ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-2 ${
                      booking.status === 'cancelled' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {booking.status === 'cancelled' ? '✕' : '✓'} Booking status: {booking.status}
                    </h3>
                    <p className={booking.status === 'cancelled' ? 'text-red-700' : 'text-green-700'}>
                      Payment status: {paymentStatusLabel(booking.paymentStatus || resolvedPaymentStatus)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Unit Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Unit Information</h3>
                <div className="space-y-4">
                  <h4 className="text-2xl font-bold text-gray-900">{property?.title || booking.propertyTitle || 'Property'}</h4>
                  <div className="flex items-start space-x-3 text-gray-600">
                    <MapPinIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                    <span>{property?.address?.fullAddress || property?.address?.city || 'Location unavailable'}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/guest/host/${booking.hostId}`)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>View Host Profile</span>
                  </button>
                </div>
              </div>

              {/* Check-in/Check-out Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Check-in</h4>
                  <p className="text-xl font-bold text-gray-900 mb-2">{formatDate(booking.checkIn)}</p>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">Guest</p>
                    <p className="text-lg font-semibold text-gray-900">{booking.guests}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Check-out</h4>
                  <p className="text-xl font-bold text-gray-900 mb-2">{formatDate(booking.checkOut)}</p>
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">Night/s</p>
                    <p className="text-lg font-semibold text-gray-900">{nights}</p>
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
                  <p className="text-lg font-semibold text-gray-900">{property?.type || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">Bedrooms</p>
                  <p className="text-lg font-semibold text-gray-900">{property?.bedrooms || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">Bathrooms</p>
                  <p className="text-lg font-semibold text-gray-900">{property?.bathrooms || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm">max guests</p>
                  <p className="text-lg font-semibold text-gray-900">{property?.maxGuests || '-'}</p>
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
                  <span className="text-lg font-bold text-gray-900">{formatAmount(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="text-lg font-bold text-gray-900">{formatAmount(0)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">{formatAmount(booking.totalAmount)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-bold text-lg ${paymentStatusColor(booking.paymentStatus || resolvedPaymentStatus)}`}>
                    {paymentStatusLabel(booking.paymentStatus || resolvedPaymentStatus)}
                  </span>
                </div>
                {remainingBalance !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining Balance</span>
                    <span className="text-lg font-bold text-gray-900">{formatAmount(remainingBalance)}</span>
                  </div>
                )}
              </div>

              {/* Downpayment Section */}
              {booking.status !== 'cancelled' && remainingBalance > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Make a Payment</h4>
                  <p className="text-blue-600 text-sm mb-4">You can make a partial or full payment now</p>
                  <button
                    onClick={() => navigate(`/guest/units/${booking.propertyId}/payment`, {
                      state: {
                        bookingData: {
                          bookingId: booking.id,
                          propertyId: booking.propertyId,
                          propertyTitle: property?.title || booking.propertyTitle,
                          checkInDate: new Date(booking.checkIn).toISOString().split('T')[0],
                          checkOutDate: new Date(booking.checkOut).toISOString().split('T')[0],
                          guests: booking.guests,
                          bookingType: booking.bookingType,
                          totalAmount: booking.totalAmount
                        }
                      }
                    })}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Make Payment
                  </button>
                </div>
              )}
              {booking.status !== 'cancelled' && remainingBalance === 0 && resolvedPaymentStatus === 'pending_confirmation' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Payment Under Review</h4>
                  <p className="text-blue-600 text-sm">Your submitted payment is pending confirmation.</p>
                </div>
              )}
            </div>

            {/* Review & Host Reply Section */}
            {review && (
              <div ref={reviewSectionRef} className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Review</h3>
                
                <div className="space-y-6">
                  {/* Guest Review */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Your review</p>
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      {review.createdAt && (
                        <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-PH')}</p>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-4">{review.comment}</p>
                    )}
                  </div>

                  {/* Host Reply */}
                  {review.hostReply && (
                    <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-900">🏠 Host's Response</p>
                        </div>
                        {review.hostReplyDate && (
                          <p className="text-sm text-blue-600">{new Date(review.hostReplyDate).toLocaleDateString('en-PH')}</p>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2">{review.hostReply}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
              <div className="space-y-4">
                {(booking.status === 'confirmed' || booking.status === 'completed') && (() => {
                  const checkoutDate = new Date(booking.checkOut);
                  const today = new Date();
                  const isPastCheckout = today > checkoutDate;
                  
                  if (isPastCheckout) {
                    return (
                      <button 
                        onClick={() => navigate(`/guest/bookings/${bookingId}/checkout-review`)}
                        className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
                      >
                        Checkout & Review
                      </button>
                    );
                  } else {
                    return (
                      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
                        <p className="font-semibold mb-1">📝 Checkout & Review</p>
                        <p className="text-xs">Available after checkout date: {new Date(booking.checkOut).toLocaleDateString('en-PH')}</p>
                      </div>
                    );
                  }
                })()}
                {booking.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
                    <p className="font-semibold mb-1">⏳ Checkout & Review</p>
                    <p className="text-xs">Available after host confirms your booking and checkout date passes</p>
                  </div>
                )}
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling || booking.status === 'cancelled'}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg disabled:opacity-50"
                >
                  {booking.status === 'cancelled' ? 'Booking Cancelled' : cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default BookingDetails;