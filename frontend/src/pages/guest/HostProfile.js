import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import API_CONFIG from '../../config/api';

const HostProfile = () => {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const host = {
    id: hostId || 'host',
    name: 'Host',
    email: 'host@smartstay.com',
    avatar: '/images/host-avatar.jpg',
    description: 'Browse this host\'s active listings and available units.',
    totalBookings: 3,
    status: 'active',
    verified: true,
    rating: 4.7,
    reviews: 12,
    joinDate: '2023'
  };

  const [hostProperties, setHostProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchHostProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await axios.get(`${apiBaseUrl}/properties?hostId=${hostId}`);
        const activeProperties = (response.data.properties || [])
          .filter(property => property.availability !== false)
          .map(property => ({
            id: property.id,
            hostName: property.hostName || '',
            hostEmail: property.hostEmail || '',
            title: property.title,
            type: (property.type || '').toUpperCase(),
            description: property.description,
            price: Number(property.pricePerNight || 0),
            rating: property.rating || 0,
            reviews: property.reviewCount || 0,
            details: `${property.bedrooms} bed • ${property.bathrooms} bath • ${property.maxGuests} guests`,
            availability: 'Active',
            image: property.images?.[0] || '/images/property-placeholder.jpg'
          }));

        setHostProperties(activeProperties);
      } catch (error) {
        console.error('Error fetching host properties:', error);
        setHostProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchHostProperties();
  }, [apiBaseUrl, hostId]);

  const hostStats = useMemo(() => ({
    properties: hostProperties.length,
    totalBookings: host.totalBookings,
    status: host.status,
    rating: host.rating,
    reviews: host.reviews
  }), [hostProperties.length]);

  const hostDisplayName = hostProperties[0]?.hostName || host.name;
  const hostDisplayEmail = hostProperties[0]?.hostEmail || host.email;

  return (
    <GuestLayout>
      <div className="space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">HOST {hostDisplayName}</h2>
                <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9Z" />
                  </svg>
                  <span className="text-sm">{hostDisplayEmail}</span>
                </div>
                <p className="text-gray-600 text-sm">{hostDisplayEmail}</p>
              </div>

              <div className="space-y-3">
                <button className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90" style={{ backgroundColor: '#4E7B22' }}>
                  Contact Host
                </button>
                <button className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50">
                  Browse Units
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">HOST {hostDisplayName}</h1>
                    {host.verified && <CheckBadgeIcon className="w-6 h-6 text-green-500" />}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    Verified
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{host.description}</p>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Properties</h3>
                  <div className="text-2xl font-bold text-green-600">{hostStats.properties}</div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h3>
                  <div className="text-2xl font-bold text-green-600">{hostStats.totalBookings}</div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {hostStats.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(hostStats.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{hostStats.rating}</span>
                  <span className="text-gray-600">{hostStats.reviews} reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hostDisplayEmail}&apos;s Properties</h2>
            <p className="text-gray-600">Browse all available units from this host</p>
          </div>

          {loadingProperties ? (
            <div className="py-10 text-center text-gray-600">Loading host units...</div>
          ) : hostProperties.length === 0 ? (
            <div className="py-10 text-center text-gray-600">No active units available for this host.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hostProperties.map((property) => (
                <div
                  key={property.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/guest/units/${property.id}`)}
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        <span>{property.type}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="font-bold text-gray-900">{property.rating}</span>
                        <span className="text-gray-600 text-sm">({property.reviews})</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold text-green-600">₱{Number(property.price || 0).toLocaleString('en-PH')}</div>
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
          )}
        </div>
      </div>
    </GuestLayout>
  );
};

export default HostProfile;