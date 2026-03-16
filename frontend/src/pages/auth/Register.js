import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'guest'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage (simple frontend storage)
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'host') {
          navigate('/host/dashboard');
        } else {
          navigate('/guest/dashboard');
        }
      } else {
        setError(data.message || 'Registration failed');
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
        <div className="max-w-sm w-full space-y-5">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Sign Up to get started!
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white/90 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border-2 border-white/40 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-all duration-200"
                  placeholder=""
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white/90 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border-2 border-white/40 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-all duration-200"
                  placeholder=""
                />
              </div>
            </div>

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
              <label htmlFor="role" className="block text-sm font-medium text-white/90 mb-2">
                I want to
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border-2 border-white/40 rounded-lg text-white focus:outline-none focus:border-white/80 transition-all duration-200"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="guest" style={{color: '#000'}}>Book properties (Guest)</option>
                <option value="host" style={{color: '#000'}}>List my properties (Host)</option>
              </select>
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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-transparent border-2 border-white/40 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-all duration-200 pr-12"
                  placeholder=""
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-white/70 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-white/40 bg-transparent focus:ring-white/50 focus:ring-offset-0"
                style={{accentColor: 'white'}}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-white/90">
                I agree to the{' '}
                <Link 
                  to="/terms-of-service" 
                  className="underline hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </Link>
                {' '}and Privacy Policy
              </label>
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-white/90 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:text-white underline transition-colors">
                  Login
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

export default Register;