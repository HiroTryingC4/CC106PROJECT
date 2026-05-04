import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GuestUnits = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  
  const [filters, setFilters] = useState({
    type: 'All types',
    guests: 'Any Guests',
    bedrooms: 'Any Bedrooms',
    duration: 'Any Duration',
    minPrice: '',
    maxPrice: '',
    sortBy: 'Default'
  });

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/properties`);
        const properties = response.data.properties || response.data.data || [];
        
        if (properties) {
          const formattedUnits = properties
            .filter(property => property.availability !== false)
            .map(property => ({
            id: property.id,
            title: property.title,
            type: property.type.toUpperCase(),
            description: property.description,
            price: `₱${Number(property.pricePerNight || 0).toLocaleString('en-PH')}`,
            period: '/night',
            details: `${property.bedrooms} bed • ${property.bathrooms} bath • ${property.maxGuests} guests`,
            rating: property.rating,
            reviews: property.reviewCount,
            image: property.images?.[0] || '/images/property-placeholder.jpg',
            typeColor: 'text-green-700',
            typeBg: 'bg-green-100'
          }));
          setUnits(formattedUnits);
          setFilteredUnits(formattedUnits);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load available units');
        setSampleUnits();
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

  // Apply filters when filters or search changes
  useEffect(() => {
    let filtered = [...units];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(unit =>
        unit.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'All types') {
      filtered = filtered.filter(unit => unit.type === filters.type.toUpperCase());
    }

    // Guests filter
    if (filters.guests !== 'Any Guests') {
      const guestCount = parseInt(filters.guests);
      filtered = filtered.filter(unit => {
        const maxGuests = parseInt(unit.details.split(' guests')[0].split('•').pop() || 0);
        return maxGuests >= guestCount;
      });
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'Any Bedrooms') {
      filtered = filtered.filter(unit => {
        const bedrooms = parseInt(unit.details.split(' bed')[0]);
        if (filters.bedrooms === 'Studio') return bedrooms === 0;
        const filterBeds = parseInt(filters.bedrooms);
        return bedrooms === filterBeds;
      });
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(unit => {
        const price = parseInt(unit.price.replace(/[^0-9]/g, ''));
        return price >= parseInt(filters.minPrice);
      });
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(unit => {
        const price = parseInt(unit.price.replace(/[^0-9]/g, ''));
        return price <= parseInt(filters.maxPrice);
      });
    }

    // Sort
    if (filters.sortBy === 'Price: Low to High') {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceA - priceB;
      });
    } else if (filters.sortBy === 'Price: High to Low') {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
        const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
        return priceB - priceA;
      });
    } else if (filters.sortBy === 'Rating: High to Low') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredUnits(filtered);
  }, [filters, searchTerm, units]);

  const setSampleUnits = () => {
    const sampleUnits = [
      {
        id: 1,
        title: 'Luxury Beachfront Condo',
        type: 'CONDO',
        description: 'Stunning 2-bedroom condo with ocean views, modern amenities, and direct beach access.',
        price: '₱5000',
        period: '/night',
        details: '2 bed • 2 bath • 4 guests',
        rating: 4.5,
        reviews: 45,
        image: '/images/beachfront-condo.jpg',
        typeColor: 'text-green-700',
        typeBg: 'bg-green-100'
      },
      {
        id: 2,
        title: 'Modern Downtown Studio',
        type: 'STUDIO',
        description: 'Cozy studio apartment in the heart of downtown, perfect for business travelers.',
        price: '₱1500',
        period: '/night',
        details: '1 bed • 1 bath • 2 guests',
        rating: 4.5,
        reviews: 28,
        image: '/images/downtown-studio.jpg',
        typeColor: 'text-green-700',
        typeBg: 'bg-green-100'
      },
      {
        id: 3,
        title: 'Family-Friendly Villa',
        type: 'VILLA',
        description: 'Spacious 3-bedroom villa with private pool, perfect for families.',
        price: '₱3000',
        period: '/night',
        details: '3 bed • 3 bath • 6 guests',
        rating: 4.5,
        reviews: 65,
        image: '/images/family-villa.jpg',
        typeColor: 'text-green-700',
        typeBg: 'bg-green-100'
      }
    ];
    setUnits(sampleUnits);
    setFilteredUnits(sampleUnits);
  };

  const clearFilters = () => {
    setFilters({
      type: 'All types',
      guests: 'Any Guests',
      bedrooms: 'Any Bedrooms',
      duration: 'Any Duration',
      minPrice: '',
      maxPrice: '',
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

  return (
    <GuestLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-start sm:text-left sm:gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#4E7B22'}}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Available Units</h1>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          {/* First Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search units..."
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
              <option>Apartment</option>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select 
              value={filters.duration}
              onChange={(e) => setFilters({...filters, duration: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            >
              <option>Any Duration</option>
              <option>1 Night</option>
              <option>2-3 Nights</option>
              <option>1 Week</option>
              <option>1 Month+</option>
            </select>

            <input
              type="text"
              placeholder="min price"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />

            <input
              type="text"
              placeholder="max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{'--tw-ring-color': '#4E7B22'}}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #4E7B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />

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
              className="text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 sm:col-span-2 lg:col-span-1" 
              style={{backgroundColor: '#4E7B22'}}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Units Grid */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner text="Loading properties..." />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {!loading && filteredUnits.length === 0 && !error && (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg">No properties found matching your filters.</p>
          </div>
        )}

        {!loading && filteredUnits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-items-center">
            {filteredUnits.map((unit) => (
            <div 
              key={unit.id} 
                className="w-full bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
              onClick={() => navigate(`/guest/units/${unit.id}`)}
            >
              {/* Property Image */}
              <div className="h-64 relative rounded-t-lg overflow-hidden">
                <img 
                  src={unit.image} 
                  alt={unit.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 bg-black bg-opacity-20 rounded-t-lg hidden" style={{zIndex: 1}}></div>
                <button
                  onClick={(e) => toggleFavorite(unit.id, e)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                >
                  {favorites.has(unit.id) ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                {/* Property Type Badge and Rating */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${unit.typeBg} ${unit.typeColor} flex items-center space-x-2`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <span>{unit.type}</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/guest/units/${unit.id}/reviews`);
                    }}
                    className="flex items-center space-x-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-lg font-bold text-gray-900">{unit.rating ? unit.rating.toFixed(1) : '0.0'}</span>
                    <span className="text-gray-600">({unit.reviews || 0})</span>
                  </button>
                </div>

                {/* Property Title with underline */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">{unit.title}</h3>
                  <div className="w-16 h-1 bg-green-500 rounded"></div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-base mb-6 leading-relaxed flex-1">{unit.description}</p>
                
                {/* Price and Details */}
                <div className="space-y-2 mt-auto">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-green-600">{unit.price}</span>
                    <span className="text-gray-600">{unit.period}</span>
                  </div>
                  <div className="text-gray-600">{unit.details}</div>
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

export default GuestUnits;