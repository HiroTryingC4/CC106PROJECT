import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const PayMongoPayment = ({ bookingId, amount, selectedMethod, minAmount, maxAmount, onSuccess, onError }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(amount ? String(amount) : '');
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod || 'gcash');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  });

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  useEffect(() => {
    if (amount !== undefined && amount !== null) {
      setPaymentAmount(String(amount));
    }
  }, [amount]);

  useEffect(() => {
    if (selectedMethod) {
      setPaymentMethod(selectedMethod);
    }
  }, [selectedMethod]);

  const resolvedAmount = useMemo(() => {
    const parsedAmount = parseFloat(paymentAmount);
    return Number.isFinite(parsedAmount) ? parsedAmount : 0;
  }, [paymentAmount]);

  const fetchPaymentConfig = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/config`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPaymentConfig(data);
    } catch (error) {
      console.error('Failed to fetch payment config:', error);
    }
  };

  const validateAmount = () => {
    if (!resolvedAmount || resolvedAmount <= 0) {
      onError?.('Please enter a valid payment amount');
      return false;
    }

    if (minAmount && resolvedAmount < minAmount) {
      onError?.(`Minimum payment amount is ₱${minAmount}`);
      return false;
    }

    if (maxAmount && resolvedAmount > maxAmount) {
      onError?.(`Maximum payment amount is ₱${maxAmount}`);
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    console.log('=== PAYMENT FLOW START ===');
    console.log('1. Payment config:', paymentConfig);
    console.log('2. Resolved amount:', resolvedAmount);
    console.log('3. Payment method:', paymentMethod);
    console.log('4. Token exists:', !!token);
    
    if (!paymentConfig?.paymongoConfigured) {
      const error = 'Payment system is not configured';
      console.error('ERROR:', error);
      alert(error);
      onError?.(error);
      return;
    }

    if (!validateAmount()) {
      console.log('Amount validation failed');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expMonth || !cardDetails.expYear || !cardDetails.cvc) {
        const error = 'Please complete all card details';
        console.error('ERROR:', error);
        alert(error);
        onError?.(error);
        return;
      }
    }

    setLoading(true);
    console.log('4. Loading state set to TRUE');

    try {
      const endpoint = paymentMethod === 'card'
        ? `${API_CONFIG.BASE_URL}/payments/create-card-payment`
        : `${API_CONFIG.BASE_URL}/payments/create-source`;

      console.log('5. Calling endpoint:', endpoint);
      console.log('6. Request body:', {
        bookingId,
        amount: resolvedAmount,
        paymentMethod,
        billing: {
          name: 'Guest User',
          email: 'guest@smartstay.com',
          phone: '09123456789'
        }
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          paymentMethod === 'card'
            ? {
                bookingId,
                amount: resolvedAmount,
                cardNumber: cardDetails.cardNumber,
                expMonth: cardDetails.expMonth,
                expYear: cardDetails.expYear,
                cvc: cardDetails.cvc,
                billing: {
                  name: 'Guest User',
                  email: 'guest@smartstay.com',
                  phone: '09123456789'
                }
              }
            : {
                bookingId,
                amount: resolvedAmount,
                paymentMethod,
                billing: {
                  name: 'Guest User',
                  email: 'guest@smartstay.com',
                  phone: '09123456789'
                }
              }
        )
      });

      console.log('7. Response status:', response.status);
      const data = await response.json();
      console.log('8. Response data:', data);

      if (!response.ok) {
        setLoading(false);
        const errorMsg = data.message || 'Payment failed';
        console.error('ERROR: API returned not OK:', errorMsg);
        alert(`Payment Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      if (data.checkoutUrl) {
        console.log('9. Redirecting to checkoutUrl:', data.checkoutUrl);
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.nextActionUrl) {
        console.log('9. Redirecting to nextActionUrl:', data.nextActionUrl);
        window.location.href = data.nextActionUrl;
        return;
      }

      console.log('10. No redirect URL, calling onSuccess');
      setLoading(false);
      onSuccess?.(data);
    } catch (error) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      setLoading(false);
      alert(`Payment failed: ${error.message}`);
      onError?.(error.message);
    }
  };

  if (!paymentConfig) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Loading payment options...</p>
      </div>
    );
  }

  if (!paymentConfig.paymongoConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          Payment system is currently unavailable. Please contact support.
        </p>
      </div>
    );
  }

  const selectedLabel = paymentMethod === 'gcash'
    ? 'GCash'
    : paymentMethod === 'paymaya'
      ? 'PayMaya'
      : 'Credit / Debit Card';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <span className="text-lg mr-2">💳</span> How Payment Works:
        </h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>Enter your payment amount below</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>Select GCash, PayMaya, or Credit / Debit Card</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>Complete payment securely through PayMongo</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>Get instant confirmation</span>
          </li>
        </ol>
      </div>

      {!amount && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="0.00"
              min={minAmount}
              max={maxAmount}
              step="0.01"
            />
          </div>
          {minAmount || maxAmount ? (
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              {minAmount && <span>Minimum: ₱{minAmount.toLocaleString('en-PH')}</span>}
              {maxAmount && <span>Maximum: ₱{maxAmount.toLocaleString('en-PH')}</span>}
            </div>
          ) : null}
        </div>
      )}

      {amount && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Amount to Pay:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₱{resolvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Processing fee (3%) included</p>
            </div>
          </div>
        </div>
      )}

      {selectedMethod && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Payment Method:</p>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
              paymentMethod === 'gcash' ? 'bg-blue-600' : paymentMethod === 'paymaya' ? 'bg-green-600' : 'bg-purple-600'
            }`}>
              {paymentMethod === 'gcash' ? 'G' : paymentMethod === 'paymaya' ? 'PM' : 'CC'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedLabel} via PayMongo</p>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'card' && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="font-semibold text-gray-900">Card Details</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
            <input
              type="text"
              value={cardDetails.cardNumber}
              onChange={(e) => setCardDetails((prev) => ({ ...prev, cardNumber: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
              <input
                type="text"
                value={cardDetails.expMonth}
                onChange={(e) => setCardDetails((prev) => ({ ...prev, expMonth: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="MM"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
              <input
                type="text"
                value={cardDetails.expYear}
                onChange={(e) => setCardDetails((prev) => ({ ...prev, expYear: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="YYYY"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVC *</label>
              <input
                type="text"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails((prev) => ({ ...prev, cvc: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="123"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || (!amount && !paymentAmount)}
        className={`w-full rounded-lg px-4 py-4 text-lg font-semibold text-white transition-all ${
          loading || (!amount && !paymentAmount)
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl'
        }`}
      >
        {loading ? 'Processing...' : amount
          ? `Pay ₱${resolvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} with ${selectedLabel}`
          : 'Complete Payment'}
      </button>

      <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 01-1.414 1.414l-4-4z" clipRule="evenodd" />
        </svg>
        <span>🔒 Secured by PayMongo • Your payment information is encrypted</span>
      </div>
    </div>
  );
};

export default PayMongoPayment;
