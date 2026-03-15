import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const HostProfile = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();

  // Sample host data - in real app this would come from API
  const host = {
    id: 'krisbernal',
    name: 'Kris Bernal',
    email: 'KRISBERNAL@GMAIL.COM',
    avatar: '/images/host-avatar.jpg',
    description: "Welcome! I'm HOST Kris Bernal from KRISBERNAL@GMAIL.COM. I'm dedicated to providing excellent accommodation experiences for all my guests. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    properties: 2,
    totalBookings: 3,
    status: 'active',
    verified: true,
    rating: 2.3,
    reviews: 3,
    joinDate: '2023',
    properties_list: [
      {
        id: 1,
        title: 'Luxury Beachfront Condo',
        type: 'CONDO',
        description: 'Stunning 2-bedroom condo with ocean views, modern amenities, and direct beach access.',
        price: 5000,
        rating: 2.3,
        reviews: 2,
        details: '2 bed • 2 bath • 4 guests',
        availability: 'Instant',
        image: '/images/luxury-condo.jpg'
      },
      {
        id: 2,
        title: 'Urban Loft Apartment',
        type: 'APARTMENT',
        description: 'Stylish loft with high ceilings and modern design in trendy neighborhood.',
        price: 5000,
        rating: 2.3,
        reviews: 1,
        details: '2 bed • 2 bath • 4 guests',
        availability: 'Instant',
        image: '/images/urban-loft.jpg'
      }
    ]
  };

  return (
    <GuestLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Host Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Host Info */}
            <div className="space-y-6">
              {/* Host Avatar and Basic Info */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">HOST {host.name}</h2>
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9Z"/>
                  </svg>
                  <span className="text-sm">{host.email}</span>
                </div>
                <p className="text-gray-600 text-sm">{host.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90" style={{backgroundColor: '#4E7B22'}}>
                  Contact Host
                </button>
                <button className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50">
                  Browse Units
                </button>
              </div>
            </div>

            {/* Right Side - Host Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Host Header with Verification */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">HOST {host.name}</h1>
                    {host.verified && (
                      <CheckBadgeIcon className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    Verified
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{host.description}</p>

              {/* Host Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Properties</h3>
                  <div className="text-2xl font-bold text-green-600">{host.properties}</div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h3>
                  <div className="text-2xl font-bold text-green-600">{host.totalBookings}</div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {host.status}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < Math.floor(host.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{host.rating}</span>
                  <span className="text-gray-600">{host.reviews} reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Host's Properties Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{host.email}'s Properties</h2>
            <p className="text-gray-600">Browse all available units from this host</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {host.properties_list.map((property) => (
              <div 
                key={property.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/guest/units/${property.id}`)}
              >
                {/* Property Image */}
                <div className={`h-48 bg-gradient-to-br ${
                  property.id === 1 ? 'from-orange-400 to-orange-600' : 'from-gray-400 to-gray-600'
                } relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>

                <div className="p-4">
                  {/* Property Type and Rating */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                      <span>{property.type}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="font-bold text-gray-900">{property.rating}</span>
                      <span className="text-gray-600 text-sm">({property.reviews})</span>
                    </div>
                  </div>

                  {/* Property Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                  {/* Price and Details */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-bold text-green-600">₱{property.price}</div>
                      <div className="text-gray-600 text-sm">/night</div>
                      <div className="text-gray-600 text-sm">{property.details}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium mb-1">
                        ● {property.availability}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button className="text-white p-4 rounded-full shadow-lg hover:opacity-90 flex items-center space-x-2" style={{backgroundColor: '#4E7B22'}}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">Chat</span>
          </button>
        </div>
      </div>
    </GuestLayout>
  );
};

export default HostProfile;