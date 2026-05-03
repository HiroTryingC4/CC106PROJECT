import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  // Auto-login on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      if (user?.role) {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'communication_admin') {
          navigate('/comm-admin/dashboard');
        } else if (user.role === 'host') {
          navigate('/host/dashboard');
        } else if (user.role === 'guest') {
          navigate('/guest/dashboard');
        }
        return;
      }

      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // If user already has a session, redirect to their dashboard
      if (storedUser && token) {
        try {
          const userData = JSON.parse(storedUser);
          const role = userData.role;

          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'communication_admin') {
            navigate('/comm-admin/dashboard');
          } else if (role === 'host') {
            navigate('/host/dashboard');
          } else if (role === 'guest') {
            navigate('/guest/dashboard');
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
      // Clear logout flag if present
      localStorage.removeItem('justLoggedOut');
    };

    checkExistingSession();
  }, [navigate, login, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const loginWithBackend = async (email, password, shouldRememberMe) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token, shouldRememberMe);

        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'communication_admin') {
          navigate('/comm-admin/dashboard');
        } else if (data.user.role === 'host') {
          navigate('/host/dashboard');
        } else {
          navigate('/guest/dashboard');
        }

        return true;
      }

      // Check if email not verified
      if (response.status === 403 && data.emailNotVerified) {
        setShowResendVerification(true);
        setResendEmail(data.email || email);
      }

      setError(data.message || 'Login failed');
      return false;
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await loginWithBackend(formData.email, formData.password, rememberMe);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);

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
        setResendSuccess(true);
        setError('');
      } else {
        setError(data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative bg-gray-900">
      {/* Full Background Image */}
      <div 
        className="absolute inset-0 bg-no-repeat"
         style={{
          backgroundImage: "url('/images/image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
      ></div>

      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>

      {/* Left Side - Form */}
      <div className="relative z-10 flex-1 flex items-center justify-start px-8 sm:px-12 lg:px-16">
        <div className="max-w-sm w-full space-y-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Welcome Back!
            </h2>
          </div>

          {error && !showResendVerification && (
            <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-500/20 border border-green-500/50 text-white px-4 py-3 rounded-lg text-sm">
              Verification email sent! Please check your inbox.
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-white/40 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-all duration-200"
                placeholder=""
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border-2 border-white/40 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-all duration-200 pr-12"
                  placeholder=""
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/40 bg-transparent focus:ring-white/50 focus:ring-offset-0"
                  style={{accentColor: 'white'}}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/90">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium hover:text-white underline text-white/90 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg text-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: loading ? '#1B5E20' : '#2E7D32'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1B5E20')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2E7D32')}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-white/90 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold hover:text-white underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* Mobile Logo - shown only on mobile */}
      <div className="lg:hidden absolute top-6 right-6 z-50">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white flex items-center">
            Smart St
            <span className="inline-block w-5 h-5 bg-white rounded-md mx-1 transform rotate-45"></span>
            y.
          </h1>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showResendVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Not Verified</h3>
              <p className="text-gray-600 mb-6">
                Please verify your email address before logging in. We sent a verification link to <strong>{resendEmail}</strong>
              </p>
              
              {resendSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4">
                  ✓ Verification email sent! Please check your inbox.
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm mb-4">
                  Didn't receive the email? Check your spam folder or click below to resend.
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendSuccess}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Verification Email'}
                </button>
                <button
                  onClick={() => {
                    setShowResendVerification(false);
                    setResendSuccess(false);
                    setError('');
                  }}
                  className="w-full rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;