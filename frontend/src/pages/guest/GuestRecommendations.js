import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const GuestRecommendations = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [filters, setFilters] = useState({
    type: 'All types',
    guests: 'Any Guests',
    bedrooms: 'Any Bedrooms',
    sortBy: 'Default'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/properties/recommendations/personalized`, {
          withCredentials: true
        });
        
        const availableProperties = (response.data.properties || [])
          .map((property) => ({
            id: property.id,
            title: property.title,
            type: (property.type || '').toUpperCase(),
            description: property.description,
            price: `₱${Number(property.pricePerNight || 0).toLocaleString('en-PH')}`,
            period: '/night',
            details: `${property.bedrooms} bed • ${property.bathrooms} bath • ${property.maxGuests} guests`,
            rating: property.rating || 0,
            reviews: property.reviewCount || 0,
            typeColor: 'text-green-700',
            typeBg: 'bg-green-100',
            image: property.images?.[0] || '/images/property-placeholder.jpg',
            imageGradient: 'from-green-400 to-green-600'
          }));

        setProperties(availableProperties);
        setIsPersonalized(response.data.personalized || false);
        setError('');
      } catch (fetchError) {
        console.error('Error fetching recommendations:', fetchError);
        setError('Unable to load recommendations at the moment.');
        setProperties([]);
        setIsPersonalized(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${apiBaseUrl}/properties/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(new Set(data.favorites.map(f => f.id)));
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    };

    fetchProperties();
    fetchFavorites();
  }, [apiBaseUrl, token]);

  const clearFilters = () => {
    setFilters({
      type: 'All types',
      guests: 'Any Guests',
      bedrooms: 'Any Bedrooms',
      sortBy: 'Default'
    });
    setSearchTerm('');
  };

  const toggleFavorite = async (propertyId, e) => {
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }

    const isFavorited = favorites.has(propertyId);
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`${apiBaseUrl}/properties/${propertyId}/favorite`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (isFavorited) {
            newFavorites.delete(propertyId);
          } else {
            newFavorites.add(propertyId);
          }
          return newFavorites;
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  let trendingProperties = [...properties];

  if (searchTerm) {
    trendingProperties = trendingProperties.filter(property =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filters.type !== 'All types') {
    trendingProperties = trendingProperties.filter(property => property.type === filters.type.toUpperCase());
  }

  if (filters.guests !== 'Any Guests') {
    const guestCount = parseInt(filters.guests, 10);
    trendingProperties = trendingProperties.filter(property => {
      const maxGuests = parseInt(property.details.split(' guests')[0].split('•').pop() || '0', 10);
      return maxGuests >= guestCount;
    });
  }

  if (filters.bedrooms !== 'Any Bedrooms') {
    trendingProperties = trendingProperties.filter(property => {
      const bedrooms = parseInt(property.details.split(' bed')[0], 10);
      if (filters.bedrooms === 'Studio') return bedrooms === 0;
      const filterBeds = parseInt(filters.bedrooms, 10);
      return bedrooms === filterBeds;
    });
  }

  if (filters.sortBy === 'Price: Low to High') {
    trendingProperties.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, ''), 10) - parseInt(b.price.replace(/[^0-9]/g, ''), 10));
  } else if (filters.sortBy === 'Price: High to Low') {
    trendingProperties.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, ''), 10) - parseInt(a.price.replace(/[^0-9]/g, ''), 10));
  } else if (filters.sortBy === 'Rating: High to Low') {
    trendingProperties.sort((a, b) => b.rating - a.rating);
  }

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{backgroundColor: '#4E7B22'}}>
              <span className="text-lg text-white">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Recommended For You</h1>
          </div>
          {isPersonalized && (
            <p className="text-gray-600 mt-2 ml-11">Based on your booking history and preferences</p>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{'--tw-ring-color': '#4E7B22'}}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
            </div>
            
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            >
              <option>All types</option>
              <option>Condo</option>
              <option>Studio</option>
              <option>Villa</option>
              <option>Cabin</option>
              <option>Apartment</option>
              <option>House</option>
            </select>

            <select 
              value={filters.guests}
              onChange={(e) => setFilters({...filters, guests: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            >
              <option>Any Guests</option>
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3-4 Guests</option>
              <option>5+ Guests</option>
            </select>

            <select 
              value={filters.bedrooms}
              onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            >
              <option>Any Bedrooms</option>
              <option>Studio</option>
              <option>1 Bedroom</option>
              <option>2 Bedrooms</option>
              <option>3+ Bedrooms</option>
            </select>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            >
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating: High to Low</option>
              <option>Most Popular</option>
            </select>

            <button 
              onClick={clearFilters}
              className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90" 
              style={{backgroundColor: '#4E7B22'}}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading recommendations...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {trendingProperties.map((property) => (
            <div 
              key={property.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
              onClick={() => navigate(`/guest/units/${property.id}`)}
            >
              {/* Property Image */}
              <div className="h-64 relative rounded-t-lg overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${property.imageGradient} bg-black bg-opacity-20 rounded-t-lg hidden`} style={{zIndex: 1}}></div>
                <button
                  onClick={(e) => toggleFavorite(property.id, e)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  {favorites.has(property.id) ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                {/* Property Type Badge and Rating */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${property.typeBg} ${property.typeColor} flex items-center space-x-2`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span>{property.type}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-lg font-bold text-gray-900">{property.rating ? property.rating.toFixed(1) : '0.0'}</span>
                    <span className="text-gray-600">({property.reviews})</span>
                  </div>
                </div>

                {/* Property Title with underline */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">{property.title}</h3>
                  <div className="w-16 h-1 bg-green-500 rounded"></div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-base mb-6 leading-relaxed flex-1">{property.description}</p>
                
                {/* Price and Details */}
                <div className="space-y-2 mt-auto">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-green-600">{property.price}</span>
                    <span className="text-gray-600">{property.period}</span>
                  </div>
                  <div className="text-gray-600">{property.details}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestRecommendations;