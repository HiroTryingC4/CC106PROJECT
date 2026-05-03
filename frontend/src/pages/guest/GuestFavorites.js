import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { HeartIcon, MapPinIcon, UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import API_CONFIG from '../../config/api';

const GuestFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/favorites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
      setError('');
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/favorite`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      // Remove from local state
      setFavorites(favorites.filter(fav => fav.id !== propertyId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove from favorites');
    }
  };

  const formatPrice = (price) => `₱${Number(price || 0).toLocaleString('en-PH')}`;

  if (loading) {
    return (
      <GuestLayout>
        <div className="p-6 text-gray-600">Loading favorites...</div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#4E7B22'}}>
            <HeartIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-1">Properties you've saved for later</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartOutlineIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Start exploring and save properties you love!</p>
            <button
              onClick={() => navigate('/guest/properties')}
              className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90"
              style={{backgroundColor: '#4E7B22'}}
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {favorites.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => handleRemoveFavorite(property.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <HeartIcon className="w-6 h-6 text-red-500" />
                  </button>

                  {/* Availability Badge */}
                  {!property.availability && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Unavailable
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                    {property.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-gray-600 text-sm mb-3">
                    <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {property.address?.city || property.address?.fullAddress || 'Location not specified'}
                    </span>
                  </div>

                  {/* Property Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3 flex-wrap">
                    <span>{property.bedrooms} bed</span>
                    <span>•</span>
                    <span>{property.bathrooms} bath</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{property.maxGuests}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3 min-h-[1.25rem]">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="ml-1 text-sm font-semibold text-gray-900">
                        {(property.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ({property.reviewCount || 0} {property.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-3 border-t mt-auto">
                    <div>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(property.pricePerNight)}
                      </span>
                      <span className="text-sm text-gray-600"> / night</span>
                    </div>
                    <button
                      onClick={() => navigate(`/guest/units/${property.id}`)}
                      className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 text-sm"
                      style={{backgroundColor: '#4E7B22'}}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GuestLayout>
  );
};

export default GuestFavorites;
