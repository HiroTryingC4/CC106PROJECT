import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const GuestRecommendations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'All types',
    guests: 'Any Guests',
    bedrooms: 'Any Bedrooms',
    sortBy: 'Default'
  });

  const trendingProperties = [
    {
      id: 1,
      title: 'Luxury Beachfront Condo',
      type: 'CONDO',
      description: 'Stunning 2-bedroom condo with ocean views, modern amenities, and direct beach access.',
      price: '₱150',
      period: '/night',
      details: '2 bed • 2 bath • 4 guests',
      rating: 4.9,
      reviews: 98,
      typeColor: 'text-green-700',
      typeBg: 'bg-green-100',
      image: '/images/beachfront-condo.jpg',
      imageGradient: 'from-orange-400 to-orange-600'
    },
    {
      id: 2,
      title: 'Modern Downtown Studio',
      type: 'STUDIO',
      description: 'Cozy studio apartment in the heart of downtown, perfect for business travelers.',
      price: '₱85',
      period: '/night',
      details: '1 bed • 1 bath • 2 guests',
      rating: 4.5,
      reviews: 28,
      typeColor: 'text-green-700',
      typeBg: 'bg-green-100',
      image: '/images/downtown-studio.jpg',
      imageGradient: 'from-gray-400 to-gray-600'
    },
    {
      id: 3,
      title: 'Family-Friendly Villa',
      type: 'VILLA',
      description: 'Spacious 3-bedroom villa with private pool, perfect for families.',
      price: '₱220',
      period: '/night',
      details: '3 bed • 3 bath • 6 guests',
      rating: 4.5,
      reviews: 65,
      typeColor: 'text-green-700',
      typeBg: 'bg-green-100',
      image: '/images/family-villa.jpg',
      imageGradient: 'from-green-400 to-green-600'
    },
    {
      id: 4,
      title: 'Cozy Mountain Cabin',
      type: 'CABIN',
      description: 'Rustic cabin with mountain views, fireplace, and hiking trails nearby.',
      price: '₱120',
      period: '/night',
      details: '2 bed • 1 bath • 4 guests',
      rating: 4.5,
      reviews: 22,
      typeColor: 'text-green-700',
      typeBg: 'bg-green-100',
      image: '/images/mountain-cabin.jpg',
      imageGradient: 'from-green-500 to-blue-500'
    },
    {
      id: 5,
      title: 'Urban Loft Apartment',
      type: 'APARTMENT',
      description: 'Stylish loft with high ceilings and modern design in trendy neighborhood.',
      price: '₱150',
      period: '/night',
      details: '1 bed • 1 bath • 2 guests',
      rating: 4.5,
      reviews: 56,
      typeColor: 'text-green-700',
      typeBg: 'bg-green-100',
      image: '/images/urban-loft.jpg',
      imageGradient: 'from-gray-500 to-gray-700'
    },
    {
      id: 6,
      title: 'Lakeside Retreat',
      type: 'HOUSE',
      description: 'Beautiful lakefront property with dock, kayaks, and stunning sunset views.',
      price: '₱280',
      period: '/night',
      details: '4 bed • 3 bath • 8 guests',
      rating: 4.9,
      reviews: 78,
      typeColor: 'text-green-700',
      typeBg: 'bg-green-100',
      image: '/images/lakeside-retreat.jpg',
      imageGradient: 'from-blue-400 to-green-500'
    }
  ];

  const clearFilters = () => {
    setFilters({
      type: 'All types',
      guests: 'Any Guests',
      bedrooms: 'Any Bedrooms',
      sortBy: 'Default'
    });
    setSearchTerm('');
  };

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{backgroundColor: '#4E7B22'}}>
            <span className="text-lg text-white">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Recommended For You</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProperties.map((property) => (
            <div 
              key={property.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
              </div>
              
              <div className="p-6">
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
                    <span className="text-lg font-bold text-gray-900">{property.rating}</span>
                    <span className="text-gray-600">({property.reviews})</span>
                  </div>
                </div>

                {/* Property Title with underline */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <div className="w-16 h-1 bg-green-500 rounded"></div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 text-base mb-6 leading-relaxed">{property.description}</p>
                
                {/* Price and Details */}
                <div className="space-y-2">
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