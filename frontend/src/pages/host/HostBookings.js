import React, { useEffect, useMemo, useState } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import {
  Bars3Icon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HostBookings = () => {
  const { user } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionBookingId, setActionBookingId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationInfo, setCancellationInfo] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cancellationResult, setCancellationResult] = useState(null);

  const formatCurrency = (amount) => `PHP ${Number(amount || 0).toLocaleString('en-PH')}`;
  const formatDate = (value) => new Date(value).toLocaleDateString('en-PH');

  const normalizeVerificationStatus = (verificationData) => {
    const rawStatus = verificationData?.status
      || verificationData?.verificationStatus
      || verificationData?.verification_status
      || user?.verificationStatus
      || user?.verification_status
      || 'not_submitted';

    const status = rawStatus === 'approved' ? 'verified' : rawStatus;
    const verified = verificationData?.verified === true || status === 'verified';

    return {
      ...(verificationData || {}),
      status,
      verified
    };
  };

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
          setVerificationStatus(normalizeVerificationStatus());
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiBaseUrl}/host/verification-status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(normalizeVerificationStatus(data));
        } else {
          setVerificationStatus(normalizeVerificationStatus());
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus(normalizeVerificationStatus());
      }
    };

    fetchVerificationStatus();
  }, [apiBaseUrl, user]);

  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

  useEffect(() => {
    const fetchHostBookings = async () => {
      if (verificationStatus === null) {
        return;
      }

      if (!isVerified) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFetchError('');

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/bookings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload.message || 'Failed to load bookings');
        }

        const payload = await response.json();
        setBookings(payload.bookings || []);
      } catch (error) {
        console.error('Error fetching host bookings:', error);
        setFetchError(error.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchHostBookings();
  }, [apiBaseUrl, verificationStatus, isVerified]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatches =
        activeTab === 'All'
          || (activeTab === 'Pending' && booking.status === 'pending')
          || (activeTab === 'Confirmed' && booking.status === 'confirmed')
          || (activeTab === 'Cancelled' && booking.status === 'cancelled');

      const normalizedSearch = searchTerm.trim().toLowerCase();
      const searchMatches = !normalizedSearch
        || String(booking.id).includes(normalizedSearch)
        || (booking.propertyTitle || '').toLowerCase().includes(normalizedSearch)
        || (booking.guestName || '').toLowerCase().includes(normalizedSearch);

      return statusMatches && searchMatches;
    });
  }, [bookings, activeTab, searchTerm]);

  const getStatusChipClass = (status) => {
    if (status === 'confirmed') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'pending') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (status === 'cancelled') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'completed') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const updateBookingStatus = async (bookingId, nextStatus) => {
    try {
      setActionBookingId(bookingId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        // Try to parse JSON; if not JSON, grab text. Log full payload for debugging.
        let errorPayload = {};
        try {
          errorPayload = await response.json();
        } catch (err) {
          try {
            const txt = await response.text();
            errorPayload = { message: txt };
          } catch (inner) {
            errorPayload = {};
          }
        }
        console.error('Booking update failed response:', response.status, errorPayload);
        // Surface the backend message when available to help debugging
        throw new Error(errorPayload.message || errorPayload.error || `Failed to update booking (status ${response.status})`);
      }

      const payload = await response.json();
      const updatedBooking = payload.booking;

      setBookings((prev) => prev.map((booking) => (
        booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
      )));

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, ...updatedBooking }));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(error.message || 'Unable to update booking status');
    } finally {
      setActionBookingId(null);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      setActionBookingId(bookingId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Failed to approve booking');
      }

      const payload = await response.json();
      const updatedBooking = payload.booking;

      setBookings((prev) => prev.map((booking) => (
        booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
      )));

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, ...updatedBooking }));
      }

      setSuccessMessage('Booking has been successfully approved!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error approving booking:', error);
      setErrorMessage(error.message || 'Unable to approve booking');
      setShowErrorModal(true);
    } finally {
      setActionBookingId(null);
    }
  };
  
  const handleReject = async (bookingId) => {
    try {
      setActionBookingId(bookingId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Failed to reject booking');
      }

      const payload = await response.json();
      const updatedBooking = payload.booking;

      setBookings((prev) => prev.map((booking) => (
        booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
      )));

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, ...updatedBooking }));
      }

      setSuccessMessage('Booking has been successfully rejected.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setErrorMessage(error.message || 'Unable to reject booking');
      setShowErrorModal(true);
    } finally {
      setActionBookingId(null);
    }
  };
  
  const handleComplete = (bookingId) => updateBookingStatus(bookingId, 'completed');

  const handleCancelBooking = async (booking) => {
    try {
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
        setErrorMessage(policyData.reason || 'Cannot cancel this booking');
        setShowErrorModal(true);
        return;
      }

      setBookingToCancel(booking);
      setCancellationInfo(policyData);
      setShowCancelModal(true);
    } catch (err) {
      console.error('Error fetching cancellation policy:', err);
      setErrorMessage('Unable to fetch cancellation policy');
      setShowErrorModal(true);
    }
  };

  const confirmCancellation = async () => {
    if (!bookingToCancel) return;

    try {
      setShowCancelModal(false);
      setActionBookingId(bookingToCancel.id);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/bookings/${bookingToCancel.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const data = await response.json();
      setBookings((prev) => prev.map((b) => (b.id === bookingToCancel.id ? data.booking : b)));

      // Store cancellation result and show success modal
      setCancellationResult(data.cancellation);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setErrorMessage(err.message || 'Unable to cancel booking');
      setShowErrorModal(true);
    } finally {
      setActionBookingId(null);
      setBookingToCancel(null);
      setCancellationInfo(null);
    }
  };

  const isPastCheckout = (checkOut) => new Date(checkOut) < new Date();

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + direction);
      return next;
    });
  };

  const getBookingsForDate = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return targetDate >= checkIn && targetDate < checkOut;
    });
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i += 1) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200" />);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayBookings = getBookingsForDate(day);
      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1 relative">
          <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
          <div className="space-y-1">
            {dayBookings.slice(0, 2).map((booking) => (
              <div
                key={`${booking.id}-${day}`}
                className={`text-xs px-1 py-0.5 rounded text-white font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                title={`${booking.propertyTitle || 'Property'} - ${booking.status}`}
              >
                #{booking.id}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{getMonthName(currentDate)}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {dayNames.map((dayName) => (
            <div key={dayName} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
              {dayName}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Success Modal */}
        {showSuccessModal && !cancellationResult && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl ring-1 ring-black/5">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Success!</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 w-full rounded-2xl bg-green-600 px-4 py-3 font-medium text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-[28px] bg-white p-6 text-center shadow-2xl ring-1 ring-black/5">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Error</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="mt-6 w-full rounded-2xl bg-red-600 px-4 py-3 font-medium text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Success Modal */}
        {showSuccessModal && cancellationResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[28px] shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h3>
                <p className="text-gray-600">The booking has been successfully cancelled</p>
              </div>

              {cancellationResult.refundAmount > 0 ? (
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Refund to Guest</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Policy:</span>
                        <span className="font-medium text-gray-900">{cancellationResult.policy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Guest Paid:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(cancellationResult.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Refund Percentage:</span>
                        <span className="font-medium text-blue-600">{cancellationResult.refundPercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                        <span className="text-gray-900 font-semibold">Refund Amount:</span>
                        <span className="font-bold text-blue-600 text-lg">{formatCurrency(cancellationResult.refundAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    The guest will be refunded within 5-7 business days
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm text-center">
                    No refund to guest based on the cancellation policy
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setCancellationResult(null);
                }}
                className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && cancellationInfo && bookingToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[28px] shadow-2xl max-w-md w-full p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                <p className="text-gray-600">Review the cancellation details below</p>
              </div>
              
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
                    <span className="text-gray-600">Guest paid:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(cancellationInfo.totalPaid || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Refund percentage:</span>
                    <span className="font-semibold text-green-600">{cancellationInfo.refundPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-900 font-semibold">Refund to guest:</span>
                    <span className="font-bold text-green-600 text-lg">{formatCurrency(cancellationInfo.refundAmount || 0)}</span>
                  </div>
                </div>

                {cancellationInfo.refundPercentage === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm font-medium">
                      ℹ️ No refund will be issued to the guest
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setBookingToCancel(null);
                    setCancellationInfo(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancellation}
                  disabled={actionBookingId === bookingToCancel?.id}
                  className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {actionBookingId === bookingToCancel?.id ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">Manage all your property bookings</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bars3Icon className="w-4 h-4" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'calendar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar View</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center items-center gap-2">
            {['All', 'Pending', 'Confirmed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by booking #, guest, or property"
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">Loading bookings...</div>
        )}

        {!loading && fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{fetchError}</div>
        )}

        {!loading && !fetchError && !isVerified && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings available</h3>
            <p className="text-gray-600 mb-6">Complete verification to start receiving bookings.</p>
            <a
              href="/host/verification"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
            >
              <span>Complete Verification</span>
            </a>
          </div>
        )}

        {!loading && !fetchError && isVerified && (
          viewMode === 'calendar' ? (
            renderCalendarView()
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">#{booking.id}</div>
                      <p className="text-gray-700 font-medium">{booking.propertyTitle || 'Property'}</p>
                      <p className="text-gray-600 text-sm">Guest: {booking.guestName || 'Guest'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusChipClass(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200 capitalize">
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Guests</p>
                      <p className="font-medium text-gray-900">{booking.guests}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailModal(true);
                      }}
                      className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 border border-gray-200"
                    >
                      View Details
                    </button>

                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(booking.id)}
                          disabled={actionBookingId === booking.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                          {actionBookingId === booking.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={actionBookingId === booking.id}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-60"
                        >
                          {actionBookingId === booking.id ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && isPastCheckout(booking.checkOut) && (
                      <button
                        onClick={() => handleComplete(booking.id)}
                        disabled={actionBookingId === booking.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                      >
                        {actionBookingId === booking.id ? 'Processing...' : 'Mark as Completed'}
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        disabled={actionBookingId === booking.id}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                      >
                        {actionBookingId === booking.id ? 'Processing...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {!loading && !fetchError && isVerified && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CalendarDaysIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Booking #{selectedBooking.id}</h2>
                  <p className="text-gray-600 mt-1">Booking details</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Property</p>
                    <p className="font-medium text-gray-900">{selectedBooking.propertyTitle || 'Property'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guest</p>
                    <p className="font-medium text-gray-900">{selectedBooking.guestName || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkIn)} {selectedBooking.checkInTime || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkOut)} {selectedBooking.checkOutTime || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guests</p>
                    <p className="font-medium text-gray-900">{selectedBooking.guests}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Booking Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedBooking.bookingType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium text-gray-900">{formatCurrency(selectedBooking.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Payment Status</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedBooking.paymentStatus}</p>
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div>
                    <p className="text-gray-500">Special Requests</p>
                    <p className="font-medium text-gray-900">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedBooking.id);
                          setShowDetailModal(false);
                        }}
                        disabled={actionBookingId === selectedBooking.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                      >
                        Approve Booking
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedBooking.id);
                          setShowDetailModal(false);
                        }}
                        disabled={actionBookingId === selectedBooking.id}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-60"
                      >
                        Reject Booking
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && isPastCheckout(selectedBooking.checkOut) && (
                    <button
                      onClick={() => {
                        handleComplete(selectedBooking.id);
                        setShowDetailModal(false);
                      }}
                      disabled={actionBookingId === selectedBooking.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                      Mark as Completed
                    </button>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleCancelBooking(selectedBooking);
                      }}
                      disabled={actionBookingId === selectedBooking.id}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HostLayout>
  );
};

export default HostBookings;
