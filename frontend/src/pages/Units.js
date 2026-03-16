import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UserGroupIcon,
  HomeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Units = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGuests, setSelectedGuests] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Sample properties data
  const properties = [
    {
      id: 1,
      title: 'Modern Downtown Apartment',
      type: 'Apartment',
      location: 'Downtown',
      price: 2500,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image: '/images/property1.jpg',
      rating: 4.8,
      reviews: 124,
      amenities: ['WiFi', 'Kitchen', 'AC', 'Parking'],
      description: 'Beautiful modern apartment in the heart of downtown with stunning city views.'
    },
    {
      id: 2,
      title: 'Cozy Beach House',
      type: 'House',
      location: 'Beachfront',
      price: 3500,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image: '/images/property2.jpg',
      rating: 4.9,
      reviews: 89,
      amenities: ['WiFi', 'Kitchen', 'Beach Access', 'BBQ'],
      description: 'Relaxing beach house with direct access to pristine sandy beaches.'
    },
    {
      id: 3,
      title: 'Luxury City Condo',
      type: 'Condo',
      location: 'City Center',
      price: 4000,
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      image: '/images/property3.jpg',
      rating: 4.7,
      reviews: 156,
      amenities: ['WiFi', 'Gym', 'Pool', 'Concierge'],
      description: 'Elegant luxury condo with premium amenities and city skyline views.'
    },
    {
      id: 4,
      title: 'Family Suburban Home',
      type: 'House',
      location: 'Suburbs',
      price: 2800,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image: '/images/property4.jpg',
      rating: 4.6,
      reviews: 73,
      amenities: ['WiFi', 'Kitchen', 'Garden', 'Parking'],
      description: 'Spacious family home perfect for large groups and extended stays.'
    },
    {
      id: 5,
      title: 'Studio Near University',
      type: 'Studio',
      location: 'University Area',
      price: 1500,
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      image: '/images/property5.jpg',
      rating: 4.4,
      reviews: 92,
      amenities: ['WiFi', 'Kitchen', 'Study Area'],
      description: 'Compact studio apartment ideal for students and short-term stays.'
    },
    {
      id: 6,
      title: 'Mountain Cabin Retreat',
      type: 'Cabin',
      location: 'Mountains',
      price: 3200,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image: '/images/property6.jpg',
      rating: 4.9,
      reviews: 67,
      amenities: ['WiFi', 'Fireplace', 'Hot Tub', 'Hiking'],
      description: 'Peaceful mountain cabin surrounded by nature and hiking trails.'
    },
    {
      id: 7,
      title: 'Historic Townhouse',
      type: 'Townhouse',
      location: 'Historic District',
      price: 2900,
      guests: 5,
      bedrooms: 3,
      bathrooms: 2,
      image: '/images/property7.jpg',
      rating: 4.5,
      reviews: 108,
      amenities: ['WiFi', 'Kitchen', 'Historic Charm', 'Parking'],
      description: 'Charming historic townhouse with original architecture and modern comforts.'
    },
    {
      id: 8,
      title: 'Penthouse Suite',
      type: 'Penthouse',
      location: 'Downtown',
      price: 5500,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image: '/images/property8.jpg',
      rating: 4.8,
      reviews: 45,
      amenities: ['WiFi', 'Terrace', 'City Views', 'Luxury'],
      description: 'Exclusive penthouse with panoramic city views and luxury amenities.'
    },
    {
      id: 9,
      title: 'Garden Villa',
      type: 'Villa',
      location: 'Residential',
      price: 4200,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image: '/images/property9.jpg',
      rating: 4.7,
      reviews: 81,
      amenities: ['WiFi', 'Garden', 'Pool', 'BBQ'],
      description: 'Beautiful villa with private garden and swimming pool.'
    },
    {
      id: 10,
      title: 'Waterfront Loft',
      type: 'Loft',
      location: 'Waterfront',
      price: 3800,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image: '/images/property10.jpg',
      rating: 4.6,
      reviews: 94,
      amenities: ['WiFi', 'Water Views', 'Modern', 'Balcony'],
      description: 'Contemporary loft with stunning waterfront views and modern design.'
    }
  ];

  // Filter properties based on search criteria
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !selectedType || property.type === selectedType;
      const matchesGuests = !selectedGuests || property.guests >= parseInt(selectedGuests);
      const matchesBedrooms = !selectedBedrooms || property.bedrooms >= parseInt(selectedBedrooms);
      const matchesLocation = !selectedLocation || property.location === selectedLocation;
      
      let matchesPrice = true;
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(p => parseInt(p));
        if (max) {
          matchesPrice = property.price >= min && property.price <= max;
        } else {
          matchesPrice = property.price >= min;
        }
      }

      return matchesSearch && matchesType && matchesGuests && matchesBedrooms && 
             matchesLocation && matchesPrice;
    });
  }, [searchTerm, selectedType, selectedGuests, selectedBedrooms, selectedLocation, priceRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedGuests('');
    setSelectedBedrooms('');
    setSelectedLocation('');
    setSelectedDuration('');
    setPriceRange('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Stay</h1>
            <p className="text-xl text-gray-600">Discover amazing properties for your next adventure</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            {/* Search Bar */}
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, property name, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Property Type */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Condo">Condo</option>
                <option value="Studio">Studio</option>
                <option value="Villa">Villa</option>
                <option value="Cabin">Cabin</option>
                <option value="Loft">Loft</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Townhouse">Townhouse</option>
              </select>

              {/* Guests */}
              <select
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Any Guests</option>
                <option value="1">1+ Guests</option>
                <option value="2">2+ Guests</option>
                <option value="4">4+ Guests</option>
                <option value="6">6+ Guests</option>
                <option value="8">8+ Guests</option>
              </select>

              {/* Bedrooms */}
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Any Bedrooms</option>
                <option value="1">1+ Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              {/* Location */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Locations</option>
                <option value="Downtown">Downtown</option>
                <option value="Beachfront">Beachfront</option>
                <option value="City Center">City Center</option>
                <option value="Suburbs">Suburbs</option>
                <option value="University Area">University Area</option>
                <option value="Mountains">Mountains</option>
                <option value="Historic District">Historic District</option>
                <option value="Residential">Residential</option>
                <option value="Waterfront">Waterfront</option>
              </select>

              {/* Price Range */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Any Price</option>
                <option value="0-2000">Under ₱2,000</option>
                <option value="2000-3000">₱2,000 - ₱3,000</option>
                <option value="3000-4000">₱3,000 - ₱4,000</option>
                <option value="4000-5000">₱4,000 - ₱5,000</option>
                <option value="5000">₱5,000+</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProperties.length} Properties Found
          </h2>
          <div className="text-sm text-gray-600">
            Showing results for your search criteria
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-75"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <HomeIcon className="w-16 h-16 text-white" />
                </div>
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-sm font-semibold text-gray-900">
                  ₱{property.price}/night
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium">{property.rating}</span>
                    <span className="text-gray-500">({property.reviews})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>

                {/* Property Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{property.guests} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HomeIcon className="w-4 h-4" />
                    <span>{property.bedrooms} bed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{property.bathrooms} bath</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{property.amenities.length - 3} more
                    </span>
                  )}
                </div>

                {/* Book Button */}
                <Link
                  to={`/guest/units/${property.id}`}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing some filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Units;