import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_CONFIG from '../../config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, loading: authLoading } = useAuth();
  const hasRun = useRef(false);
  const [countdown, setCountdown] = useState(10);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);

  const amount = searchParams.get('amount');
  const paymentMethodParam = searchParams.get('paymentMethod');
  const pendingIdFromUrl = searchParams.get('pendingId');

  const paymentMethodLabel =
    paymentMethodParam === 'grab_pay' ? 'PAYMONGO MAYA' :
    paymentMethodParam === 'gcash' ? 'PAYMONGO GCASH' :
    paymentMethodParam === 'card' ? 'PAYMONGO CARD' :
    (paymentMethodParam || '').toUpperCase();

  useEffect(() => {
    if (authLoading) return;
    if (hasRun.current) return;
    hasRun.current = true;

    const createBooking = async () => {
      try {
        if (!pendingIdFromUrl) {
          setError('Booking reference not found. Please contact support.');
          setIsProcessing(false);
          return;
        }

        let pendingBooking;
        try {
          const res = await axios.get(
            `${API_CONFIG.BASE_URL}/pending-bookings/${pendingIdFromUrl}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {}, withCredentials: true }
          );
          if (!res.data?.bookingData) {
            setError('Booking data not found or expired. Please try booking again.');
            setIsProcessing(false);
            return;
          }
          pendingBooking = res.data.bookingData;
        } catch {
          setError('Failed to retrieve booking information. Please contact support.');
          setIsProcessing(false);
          return;
        }

        setBookingInfo(pendingBooking);

        const bookingPayload = {
          propertyId: pendingBooking.propertyId,
          checkIn: pendingBooking.checkIn,
          checkOut: pendingBooking.checkOut,
          checkInTime: pendingBooking.checkInTime,
          checkOutTime: pendingBooking.checkOutTime,
          bookingType: pendingBooking.bookingType,
          guests: pendingBooking.guests,
          specialRequests: pendingBooking.specialRequests,
          metadata: {
            ...(pendingBooking.metadata || {}),
            email: pendingBooking.guestInfo?.email,
            firstName: pendingBooking.guestInfo?.firstName,
            lastName: pendingBooking.guestInfo?.lastName,
            phone: pendingBooking.guestInfo?.phone
          },
          promoCodeId: pendingBooking.promoCodeId || undefined,
          payment: {
            amount: parseFloat(amount),
            paymentMethod: paymentMethodParam,
            transactionId: searchParams.get('sourceId') || searchParams.get('paymentIntentId') || '',
            referenceNumber: searchParams.get('sourceId') || searchParams.get('paymentIntentId') || '',
            status: 'completed',
            metadata: {
              sourceId: searchParams.get('sourceId'),
              paymentIntentId: searchParams.get('paymentIntentId')
            }
          }
        };

        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/bookings/with-payment`,
          bookingPayload,
          { headers: token ? { Authorization: `Bearer ${token}` } : {}, withCredentials: true }
        );

        if (response.data?.booking) {
          const txId = searchParams.get('sourceId') || searchParams.get('paymentIntentId') || '';
          setBookingConfirmation({
            bookingId: response.data.booking.id,
            transactionId: txId,
            paymentDate: new Date().toLocaleDateString(),
            paymentTime: new Date().toLocaleTimeString(),
            paymentAmount: parseFloat(amount),
            paymentMethod: paymentMethodLabel,
            referenceNumber: txId,
            remainingBalance: Number(response.data.remainingBalance || 0),
            status: 'Confirmed - Payment Received',
            promoCode: response.data.booking.metadata?.promoCode || null,
            discountAmount: response.data.booking.metadata?.discountAmount || 0
          });
        }
        setIsProcessing(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create booking. Please contact support.');
        setIsProcessing(false);
      }
    };

    createBooking();
  }, [authLoading, amount, paymentMethodParam, searchParams, token, pendingIdFromUrl, paymentMethodLabel]);

  useEffect(() => {
    if (isProcessing || error) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isProcessing, error]);

  useEffect(() => {
    if (countdown === 0) navigate('/guest/bookings');
  }, [countdown, navigate]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const content = `SMART STAY BOOKINGS\nBooking Confirmation & Receipt\n\nBooking ID: ${bookingConfirmation?.bookingId}\nTransaction ID: ${bookingConfirmation?.transactionId}\nDate: ${bookingConfirmation?.paymentDate} ${bookingConfirmation?.paymentTime}\n\nPAYMENT DETAILS:\nPayment Method: ${bookingConfirmation?.paymentMethod}\nReference Number: ${bookingConfirmation?.referenceNumber}\nAmount Paid: ₱${bookingConfirmation?.paymentAmount}\nRemaining Balance: ₱${bookingConfirmation?.remainingBalance}\nStatus: ${bookingConfirmation?.status}\n\nThank you for choosing Smart Stay Bookings!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${bookingConfirmation?.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Booking...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment and create your booking.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={() => navigate('/guest/properties')} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full space-y-6">
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
              <p className="text-gray-600">Booking ID: {bookingConfirmation?.bookingId}</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={handlePrint} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <PrinterIcon className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button onClick={handleDownload} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {bookingInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{bookingInfo.guestInfo?.firstName} {bookingInfo.guestInfo?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{bookingInfo.guestInfo?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{bookingInfo.guestInfo?.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{bookingConfirmation?.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-medium">{bookingConfirmation?.paymentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Time:</span>
                    <span className="font-medium">{bookingConfirmation?.paymentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{bookingConfirmation?.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference Number:</span>
                    <span className="font-medium">{bookingConfirmation?.referenceNumber}</span>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span>₱{Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {bookingConfirmation?.promoCode && (
                    <div className="flex justify-between text-red-600 text-sm">
                      <span>Promo ({bookingConfirmation.promoCode}):</span>
                      <span>-₱{Number(bookingConfirmation.discountAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₱{Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Amount Paid:</span>
                    <span>₱{bookingConfirmation?.paymentAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Remaining Balance:</span>
                    <span>₱{bookingConfirmation?.remainingBalance?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Status</h3>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">{bookingConfirmation?.status}</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Payment confirmed. A confirmation email will be sent shortly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please save this confirmation for your records</li>
              <li>• You will receive an email confirmation shortly</li>
              <li>• Contact us if you need to make any changes to your booking</li>
              <li>• Check-in instructions will be sent 24 hours before your arrival</li>
            </ul>
          </div>

          {/* Countdown + Actions */}
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800">
              Redirecting to your bookings in {countdown} seconds...
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/guest/bookings')} className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
              View My Bookings
            </button>
            <button onClick={() => navigate('/guest/dashboard')} className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
