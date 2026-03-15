import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleGuestTrial = () => {
    setLoading(true);
    
    // Create a trial guest user
    const trialGuestUser = {
      id: 'trial-guest-001',
      firstName: 'Jess',
      lastName: 'Trial',
      email: 'guest.trial@smartstay.com',
      role: 'guest',
      isTrial: true
    };
    
    const trialToken = 'trial-token-' + Date.now();
    
    // Use the login function from AuthContext
    login(trialGuestUser, trialToken);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/guest/dashboard');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Use the login function from AuthContext
        login(data.user, data.token);
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'host') {
          navigate('/host/dashboard');
        } else {
          navigate('/guest/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* Full Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
         style={{
          backgroundImage: "url('/images/register-background.png')", // You can use the same image or a different one
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

            {/* Guest Trial Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGuestTrial}
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border-2 border-white/60 rounded-lg text-lg font-semibold text-white bg-transparent hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up trial...' : 'Try as Guest (No Registration)'}
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