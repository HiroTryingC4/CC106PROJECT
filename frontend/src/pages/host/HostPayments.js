import React, { useEffect, useMemo, useState } from 'react';
import HostLayout from '../../components/common/HostLayout';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import { 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HostPayments = () => {
  const { token, user } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingVerification, setLoadingVerification] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [actionPaymentId, setActionPaymentId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const isVerified = ['verified', 'approved'].includes(verificationStatus?.status) || verificationStatus?.verified === true;

  const fetchPayments = async () => {
    if (!token) {
      return;
    }

    try {
      setLoadingPayments(true);
      setFetchError('');

      const response = await fetch(`${apiBaseUrl}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Failed to fetch payments');
      }

      const payload = await response.json();
      setPayments(payload.payments || []);
    } catch (error) {
      console.error('Error fetching host payments:', error);
      setFetchError(error.message || 'Failed to load payments');
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        if (!token) {
          setVerificationStatus(normalizeVerificationStatus());
          return;
        }

        const response = await fetch(`${apiBaseUrl}/host/verification-status`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
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
      } finally {
        setLoadingVerification(false);
      }
    };

    fetchVerificationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, token]);

  useEffect(() => {
    if (loadingVerification) {
      return;
    }

    if (!isVerified) {
      setPayments([]);
      return;
    }

    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingVerification, isVerified]);

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      setActionPaymentId(paymentId);
      let response = await fetch(`${apiBaseUrl}/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.status === 404) {
        const fallbackPath = status === 'completed' ? 'approve' : 'reject';
        response = await fetch(`${apiBaseUrl}/payments/${paymentId}/${fallbackPath}`, {
          method: 'PUT',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include'
        });
      }

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || 'Failed to update payment status');
      }

      await fetchPayments();
      
      const actionText = status === 'completed' ? 'approved' : 'declined';
      setSuccessMessage(`Payment has been successfully ${actionText}.`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error reviewing payment:', error);
      setErrorMessage(error.message || 'Unable to update payment status');
      setShowErrorModal(true);
    } finally {
      setActionPaymentId(null);
    }
  };

  const formatCurrency = (value) => `PHP ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (value) => new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const paymentSummary = useMemo(() => {
    const completed = payments.filter((payment) => payment.status === 'completed');
    const pending = payments.filter((payment) => payment.status === 'pending');
    const totalRevenue = completed.reduce((sum, payment) => sum + Number(payment.hostPayout || payment.amount || 0), 0);
    const averageTransaction = completed.length > 0
      ? totalRevenue / completed.length
      : 0;

    return {
      totalRevenue,
      completedTransactions: completed.length,
      pendingTransactions: pending.length,
      avgTransaction: averageTransaction
    };
  }, [payments]);

  const pendingDeposits = useMemo(
    () => payments.filter((payment) => payment.status === 'pending'),
    [payments]
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
      case 'Refunded':
        return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method) => {
    switch (String(method || '').toLowerCase()) {
      case 'grab_pay': return 'Maya';
      case 'gcash': return 'GCash';
      case 'card': return 'Card';
      case 'paymaya': return 'Maya';
      default: return String(method || '').toUpperCase();
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Booking': return 'bg-blue-100 text-blue-800';
      case 'Deposit': return 'bg-blue-100 text-blue-800';
      case 'Refund': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loading = loadingVerification || (isVerified && loadingPayments);

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track all transactions and revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(paymentSummary.totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">From completed payments</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Completed Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-gray-900">{paymentSummary.completedTransactions}</p>
                <p className="text-sm text-gray-500 mt-1">Transactions</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-gray-900">{paymentSummary.pendingTransactions}</p>
                <p className="text-sm text-red-500 mt-1">Requires Action</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Average Transaction */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Transaction</h3>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(paymentSummary.avgTransaction)}</p>
                <p className="text-sm text-gray-500 mt-1">Per Booking</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Deposits Section */}
        {isVerified && pendingDeposits.length > 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Pending Deposits ({pendingDeposits.length})</h3>
            </div>
            
            <div className="space-y-4">
              {pendingDeposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-yellow-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{deposit.guestName || `Guest #${deposit.payerUserId}`}</h4>
                    <p className="text-sm text-gray-600">
                      {deposit.propertyTitle || 'Property'} • {formatCurrency(deposit.amount)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updatePaymentStatus(deposit.id, 'failed')}
                      disabled={actionPaymentId === deposit.id}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      {actionPaymentId === deposit.id ? 'Processing...' : 'Decline'}
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(deposit.id, 'completed')}
                      disabled={actionPaymentId === deposit.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      {actionPaymentId === deposit.id ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !isVerified ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment features locked</h3>
              <p className="text-gray-600 mb-6">Complete verification to access payment management and transaction history.</p>
              <a
                href="/host/verification"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2 font-medium"
              >
                <span>Complete Verification</span>
              </a>
            </div>
          </div>
        ) : null}

        {/* All Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          </div>

          {loading && (
            <div className="text-center py-12 text-gray-600">Loading payments...</div>
          )}

          {!loading && fetchError && (
            <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-sm">{fetchError}</div>
          )}

          {!loading && isVerified && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        PAY-{String(transaction.id).padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{transaction.bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.guestName || `Guest #${transaction.payerUserId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.propertyTitle || 'Property'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor('Booking')}`}>
                          {formatPaymentMethod(transaction.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {String(transaction.status || '').charAt(0).toUpperCase() + String(transaction.status || '').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.status === 'pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updatePaymentStatus(transaction.id, 'failed')}
                              disabled={actionPaymentId === transaction.id}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(transaction.id, 'completed')}
                              disabled={actionPaymentId === transaction.id}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions available</h3>
              <p className="text-gray-600">
                {isVerified
                  ? 'No payment records found yet.'
                  : 'Complete verification to view and manage payment history.'}
              </p>
            </div>
          ) : null}
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
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
      </div>
    </HostLayout>
  );
};

export default HostPayments;