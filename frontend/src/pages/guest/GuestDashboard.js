import React from 'react';
import { Link } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { useAuth } from '../../contexts/AuthContext';

const GuestDashboard = () => {
  const { user } = useAuth();
  const bookings = [
    {
      id: 'Booking #1',
      dates: '6/15/2024 - 6/20/2024',
      price: '₱750',
      status: 'confirmed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'Booking #2',
      dates: '7/1/2024 - 7/7/2024',
      price: '₱1520',
      status: 'pending',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'Booking #3',
      dates: '5/1/2024 - 5/3/2024',
      price: '₱540',
      status: 'completed',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'Booking #4',
      dates: '2/22/2024 - 2/25/2024',
      price: '₱21321',
      status: 'confirmed',
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'Booking #5',
      dates: '2/24/2024 - 2/25/2024',
      price: '₱21321',
      status: 'confirmed',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <GuestLayout>
      <div className="space-y-8">
        {/* Trial Banner */}
        {user?.isTrial && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Trial Mode Active</h3>
                  <p className="text-yellow-700 text-sm">You're exploring Smart Stay with sample data. Create an account to start booking real properties!</p>
                </div>
              </div>
              <Link 
                to="/register"
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-medium"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your booking overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">17</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming</h3>
            <p className="text-3xl font-bold text-green-600">2</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-blue-600">17</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spend</h3>
            <p className="text-3xl font-bold text-purple-600">₱23031</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded">
                View all
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {bookings.map((booking, index) => (
              <div key={index} className="p-6 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{booking.id}</h3>
                      <p className="text-sm text-gray-500">{booking.dates}</p>
                      <p className="text-sm font-medium text-blue-600">{booking.price}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${booking.statusColor}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                <button className="text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90" style={{backgroundColor: '#4E7B22'}}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Browsing Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 mr-2">📊</span>
            <h2 className="text-xl font-semibold text-gray-900">Your Browsing Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Properties Viewed</h3>
              <p className="text-2xl font-bold text-blue-600">123</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Preferred Property Types</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Condo</span>
                  <span className="text-gray-500">53 views</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Apartment</span>
                  <span className="text-gray-500">28 views</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Studio</span>
                  <span className="text-gray-500">9 views</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Your Price Range</h3>
              <p className="text-sm text-gray-700">₱15 - ₱2132</p>
              <p className="text-xs text-gray-500">Average: ₱924/night</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Amenities You Look For:</h3>
            <div className="flex flex-wrap gap-2">
              {['WiFi', 'Air Conditioning', 'Pool', 'Kitchen', 'Parking'].map((amenity) => (
                <span key={amenity} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestDashboard;