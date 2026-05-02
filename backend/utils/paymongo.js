const axios = require('axios');

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

const isPayMongoConfigured = () => {
  return Boolean(PAYMONGO_SECRET_KEY && PAYMONGO_PUBLIC_KEY);
};

const getAuthHeader = () => {
  const auth = Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64');
  return `Basic ${auth}`;
};

/**
 * Create a PayMongo Payment Intent
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in centavos (e.g., 10000 = PHP 100.00)
 * @param {string} params.currency - Currency code (default: PHP)
 * @param {string} params.description - Payment description
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent object
 */
const createPaymentIntent = async ({ amount, currency = 'PHP', description, metadata = {} }) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured. Set PAYMONGO_SECRET_KEY and PAYMONGO_PUBLIC_KEY.');
  }

  // PayMongo metadata values must be flat strings
  const flatMetadata = Object.fromEntries(
    Object.entries(metadata).map(([k, v]) => [k, String(v)])
  );

  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/payment_intents`,
      {
        data: {
          attributes: {
            amount: Math.round(amount * 100),
            payment_method_allowed: ['gcash', 'paymaya', 'card'],
            payment_method_options: {
              card: { request_three_d_secure: 'any' }
            },
            currency,
            description,
            statement_descriptor: 'SmartStay',
            metadata: flatMetadata
          }
        }
      },
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo createPaymentIntent error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create payment intent');
  }
};

/**
 * Create a PayMongo Payment Method
 * @param {Object} params - Payment method parameters
 * @param {string} params.type - Payment method type (card, gcash, paymaya)
 * @param {Object} params.details - Payment method details
 * @returns {Promise<Object>} Payment method object
 */
const createPaymentMethod = async ({ type, details }) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/payment_methods`,
      {
        data: {
          attributes: {
            type,
            details
          }
        }
      },
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo createPaymentMethod error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create payment method');
  }
};

/**
 * Attach Payment Method to Payment Intent
 * @param {string} paymentIntentId - Payment intent ID
 * @param {string} paymentMethodId - Payment method ID
 * @param {string} clientKey - Client key from payment intent
 * @returns {Promise<Object>} Updated payment intent
 */
const attachPaymentIntent = async (paymentIntentId, paymentMethodId, clientKey) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
            return_url: process.env.FRONTEND_URL || 'http://localhost:3000'
          }
        }
      },
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo attachPaymentIntent error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to attach payment method');
  }
};

/**
 * Retrieve Payment Intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const response = await axios.get(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
      {
        headers: {
          'Authorization': getAuthHeader()
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo retrievePaymentIntent error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to retrieve payment intent');
  }
};

/**
 * Create a GCash Payment Source
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in centavos
 * @param {string} params.description - Payment description
 * @param {Object} params.billing - Billing details
 * @returns {Promise<Object>} Payment source object with checkout URL
 */
const createGCashSource = async ({ amount, description, billing = {}, bookingId, paymentMethod = 'gcash', metadata = {} }) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const pendingId = metadata.pendingId || '';
    const response = await axios.post(
      `${PAYMONGO_API_URL}/sources`,
      {
        data: {
          attributes: {
            type: 'gcash',
            amount: Math.round(amount * 100),
            currency: 'PHP',
            redirect: {
              success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?pendingId=${pendingId}&amount=${amount}&paymentMethod=${paymentMethod}`,
              failed: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`
            },
            billing,
            description,
            metadata
          }
        }
      },
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo createGCashSource error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create GCash payment source');
  }
};

/**
 * Create a PayMaya Payment Source
 * Note: PayMongo may have deprecated 'paymaya' source type.
 * This function now creates a grab_pay source as an alternative.
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in centavos
 * @param {string} params.description - Payment description
 * @param {Object} params.billing - Billing details
 * @returns {Promise<Object>} Payment source object with checkout URL
 */
const createPayMayaSource = async ({ amount, description, billing = {}, bookingId, paymentMethod = 'grab_pay', metadata = {} }) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const pendingId = metadata.pendingId || '';
    const response = await axios.post(
      `${PAYMONGO_API_URL}/sources`,
      {
        data: {
          attributes: {
            type: 'grab_pay',
            amount: Math.round(amount * 100),
            currency: 'PHP',
            redirect: {
              success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?pendingId=${pendingId}&amount=${amount}&paymentMethod=${paymentMethod}`,
              failed: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`
            },
            billing,
            description,
            metadata
          }
        }
      },
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo createPayMayaSource error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create PayMaya/GrabPay payment source');
  }
};

/**
 * Create a Payment from Source
 * @param {string} sourceId - Source ID
 * @param {string} description - Payment description
 * @returns {Promise<Object>} Payment object
 */
const createPaymentFromSource = async (sourceId, description) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const response = await axios.post(
      `${PAYMONGO_API_URL}/payments`,
      {
        data: {
          attributes: {
            amount: 0, // Amount is already in the source
            source: {
              id: sourceId,
              type: 'source'
            },
            currency: 'PHP',
            description
          }
        }
      },
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo createPaymentFromSource error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to create payment from source');
  }
};

/**
 * Retrieve a Payment Source
 * @param {string} sourceId - Source ID
 * @returns {Promise<Object>} Source object
 */
const retrieveSource = async (sourceId) => {
  if (!isPayMongoConfigured()) {
    throw new Error('PayMongo is not configured.');
  }

  try {
    const response = await axios.get(
      `${PAYMONGO_API_URL}/sources/${sourceId}`,
      {
        headers: {
          'Authorization': getAuthHeader()
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('PayMongo retrieveSource error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.detail || 'Failed to retrieve source');
  }
};

module.exports = {
  isPayMongoConfigured,
  createPaymentIntent,
  createPaymentMethod,
  attachPaymentIntent,
  retrievePaymentIntent,
  createGCashSource,
  createPayMayaSource,
  createPaymentFromSource,
  retrieveSource,
  PAYMONGO_PUBLIC_KEY
};
