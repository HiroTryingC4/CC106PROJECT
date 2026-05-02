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

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* Full Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
         style={{
          backgroundImage: "url('/images/image.png')",
        }}
      ></div>

      {/* Optional overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Left Side - Form */}
      <div className="relative z-10 flex-1 flex items-center justify-start px-8 sm:px-12 lg:px-16">
        <div className="max-w-sm w-full space-y-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Welcome Back!
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg text-sm">
              {error}
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
    </div>
  );
};

export default Login;