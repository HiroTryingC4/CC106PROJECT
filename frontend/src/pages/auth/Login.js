import React, { useState, useEffect } from 'react';
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

  // Auto-login on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      // If user already has a session, redirect to their dashboard
      if (user && token) {
        try {
          const userData = JSON.parse(user);
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
  }, [navigate, login]);

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
      id: 5, // Match backend guest ID
      firstName: 'Jane',
      lastName: 'Guest',
      email: 'guest@smartstay.com',
      role: 'guest',
      isTrial: true
    };
    
    const trialToken = 'token_5_' + Date.now();
    
    // Use the login function from AuthContext
    login(trialGuestUser, trialToken);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/guest/dashboard');
    }, 1000);
  };

  const handleHostLogin = () => {
    setLoading(true);
    
    // Create host user
    const hostUser = {
      id: 3, // Changed to match backend data
      firstName: 'John',
      lastName: 'Host',
      email: 'host@smartstay.com',
      role: 'host',
      isHost: true
    };
    
    const hostToken = 'token_3_' + Date.now(); // Changed to match backend token format
    
    // Use the login function from AuthContext
    login(hostUser, hostToken);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/host/dashboard');
    }, 1000);
  };

  const handleAdminLogin = () => {
    setLoading(true);
    
    // Create admin user
    const adminUser = {
      id: 1, // Match backend admin ID
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@smartstay.com',
      role: 'admin',
      isAdmin: true
    };
    
    const adminToken = 'token_1_' + Date.now();
    
    // Use the login function from AuthContext
    login(adminUser, adminToken);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/admin/dashboard');
    }, 1000);
  };

  const handleCommAdminLogin = () => {
    setLoading(true);
    
    // Create communication admin user
    const commAdminUser = {
      id: 2, // Match backend comm admin ID
      firstName: 'Communication',
      lastName: 'Admin',
      email: 'comadmin@smartstay.com',
      role: 'communication_admin',
      isCommAdmin: true
    };
    
    const commAdminToken = 'token_2_' + Date.now();
    
    // Use the login function from AuthContext
    login(commAdminUser, commAdminToken);
    
    setTimeout(() => {
      setLoading(false);
      navigate('/comm-admin/dashboard');
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Host backdoor credentials
    if (formData.email === 'host@smartstay.com' && formData.password === 'host123') {
      const hostUser = {
        id: 3, // Changed to match backend data
        firstName: 'John',
        lastName: 'Host',
        email: 'host@smartstay.com',
        role: 'host',
        isHost: true
      };
      
      const hostToken = 'token_3_' + Date.now(); // Changed to match backend token format
      login(hostUser, hostToken);
      
      setTimeout(() => {
        setLoading(false);
        navigate('/host/dashboard');
      }, 1000);
      return;
    }

    // Communication Admin backdoor credentials
    if (formData.email === 'comadmin@smartstay.com' && formData.password === 'comadmin123') {
      const commAdminUser = {
        id: 2,
        firstName: 'Communication',
        lastName: 'Admin',
        email: 'comadmin@smartstay.com',
        role: 'communication_admin',
        isCommAdmin: true
      };
      
      const commAdminToken = 'token_2_' + Date.now();
      login(commAdminUser, commAdminToken);
      
      setTimeout(() => {
        setLoading(false);
        navigate('/comm-admin/dashboard');
      }, 1000);
      return;
    }

    // Admin backdoor credentials
    if (formData.email === 'admin@smartstay.com' && formData.password === 'admin123') {
      const adminUser = {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@smartstay.com',
        role: 'admin',
        isAdmin: true
      };
      
      const adminToken = 'token_1_' + Date.now();
      login(adminUser, adminToken);
      
      setTimeout(() => {
        setLoading(false);
        navigate('/admin/dashboard');
      }, 1000);
      return;
    }

    // Guest credentials
    if (formData.email === 'guest@smartstay.com' && formData.password === 'guest123') {
      const guestUser = {
        id: 5,
        firstName: 'Jane',
        lastName: 'Guest',
        email: 'guest@smartstay.com',
        role: 'guest'
      };
      
      const guestToken = 'token_5_' + Date.now();
      login(guestUser, guestToken);
      
      setTimeout(() => {
        setLoading(false);
        navigate('/guest/dashboard');
      }, 1000);
      return;
    }

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
        } else if (data.user.role === 'communication_admin') {
          navigate('/comm-admin/dashboard');
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
              <p className="text-xs text-yellow-300 mb-3 flex items-center space-x-1">
                <span>⚠️</span>
                <span>Your email is your username - please don't forget it!</span>
              </p>
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

            {/* Admin Backdoor Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border-2 border-red-400/60 rounded-lg text-lg font-semibold text-red-200 bg-transparent hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accessing admin...' : '🛡️ Admin Access (Demo)'}
              </button>
            </div>

            {/* Communication Admin Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCommAdminLogin}
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border-2 border-blue-400/60 rounded-lg text-lg font-semibold text-blue-200 bg-transparent hover:bg-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accessing comm admin...' : '💬 Communication Admin (Demo)'}
              </button>
            </div>

            {/* Host Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleHostLogin}
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border-2 border-green-400/60 rounded-lg text-lg font-semibold text-green-200 bg-transparent hover:bg-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accessing host panel...' : '🏠 Host Access (Demo)'}
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

            {/* Demo Credentials Info */}
            <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/20">
              <h3 className="text-white font-semibold text-sm mb-2">🎯 Demo Credentials:</h3>
              <div className="space-y-1 text-xs text-white/80">
                <p><strong>Admin:</strong> admin@smartstay.com / admin123</p>
                <p><strong>Comm Admin:</strong> comadmin@smartstay.com / comadmin123</p>
                <p><strong>Host:</strong> host@smartstay.com / host123</p>
                <p><strong>Guest:</strong> guest@smartstay.com / guest123</p>
              </div>
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