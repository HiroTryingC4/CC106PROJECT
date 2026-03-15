import React from 'react';
import { useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';

const GuestRecommendations = () => {
  const navigate = useNavigate();

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
      imageGradient: 'from-blue-400 to-green-500'
    }
  ];

  return (
    <GuestLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Recommended For You</h1>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-gray-600">Properties we think you'll love based on your preferences</p>
        </div>

        {/* Trending Now Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Now</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProperties.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/guest/units/${property.id}`)}
              >
                {/* Property Image */}
                <div className={`h-48 bg-gradient-to-br ${property.imageGradient} relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
                
                <div className="p-4">
                  {/* Property Type Badge and Rating */}
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${property.typeBg} ${property.typeColor} flex items-center space-x-2`}>
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
                  
                  {/* Price and Details */}
                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-green-600">{property.price}</span>
                      <span className="text-gray-600 text-sm">{property.period}</span>
                    </div>
                    <div className="text-gray-600 text-sm">{property.details}</div>
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

export default GuestRecommendations;