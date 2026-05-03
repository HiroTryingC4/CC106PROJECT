import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const apiBaseUrl = API_CONFIG.BASE_URL;

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    console.log('🔍 Frontend: Attempting to verify email');
    console.log('   Token from URL:', token);
    console.log('   Token length:', token ? token.length : 0);
    console.log('   API URL:', `${apiBaseUrl}/auth/verify-email`);
    
    try {
      const requestBody = { token };
      console.log('   Request body:', JSON.stringify(requestBody));
      
      const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('   Response status:', response.status);
      const data = await response.json();
      console.log('   Response data:', data);

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        if (data.expired || data.message.includes('expired')) {
          setStatus('expired');
        } else if (data.alreadyVerified) {
          setStatus('success');
        } else {
          setStatus('error');
        }
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('❌ Frontend error:', error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    setResending(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/BG-IMAGE.png')"
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <ArrowPathIcon className="h-16 w-16 text-green-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-4">Redirecting you to login page...</p>
              <Link
                to="/login"
                className="inline-block w-full py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block w-full py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center">
              <XCircleIcon className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Enter your email to receive a new verification link
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-3 px-4 border border-transparent rounded-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </form>

              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-sm text-green-600 hover:text-green-700 underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
