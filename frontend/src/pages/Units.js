import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UserGroupIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import API_CONFIG from '../config/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Units = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGuests, setSelectedGuests] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties?availability=true`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const props = data.properties || data || [];
        setProperties(props);
        // Extract unique locations and types for filters
        setLocations([...new Set(props.map(p => {
          const addr = p.address || '';
          return typeof addr === 'object' ? addr.city || addr.fullAddress || '' : addr;
        }).filter(Boolean))]);
        setPropertyTypes([...new Set(props.map(p => p.type).filter(Boolean))]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const title = property.title || '';
      const addrRaw = property.address || '';
      const location = typeof addrRaw === 'object'
        ? addrRaw.city || addrRaw.fullAddress || ''
        : addrRaw;
      const type = property.type || '';

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || type === selectedType;
      const matchesGuests = !selectedGuests || (property.maxGuests || property.max_guests || 0) >= parseInt(selectedGuests);
      const matchesBedrooms = !selectedBedrooms || (property.bedrooms || 0) >= parseInt(selectedBedrooms);
      const matchesLocation = !selectedLocation || location === selectedLocation;

      let matchesPrice = true;
      if (priceRange) {
        const price = parseFloat(property.pricePerNight || property.price_per_night || 0);
        const [min, max] = priceRange.split('-').map(p => parseInt(p));
        matchesPrice = max ? (price >= min && price <= max) : price >= min;
      }

      return matchesSearch && matchesType && matchesGuests && matchesBedrooms && matchesLocation && matchesPrice;
    });
  }, [properties, searchTerm, selectedType, selectedGuests, selectedBedrooms, selectedLocation, priceRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedGuests('');
    setSelectedBedrooms('');
    setSelectedLocation('');
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
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
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
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {loading ? 'Loading...' : `${filteredProperties.length} Properties Found`}
          </h2>
          <div className="text-sm text-gray-600">Showing results for your search criteria</div>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching properties..." />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => {
            const title = property.title || 'Unnamed Property';
            const addrRaw = property.address || '';
            const location = typeof addrRaw === 'object'
              ? addrRaw.city || addrRaw.fullAddress || 'Unknown Location'
              : addrRaw || 'Unknown Location';
            const type = property.type || 'Property';
            const price = parseFloat(property.pricePerNight || property.price_per_night || 0);
            const guests = property.maxGuests || property.max_guests || 0;
            const bedrooms = property.bedrooms || 0;
            const bathrooms = property.bathrooms || 0;
            const rating = parseFloat(property.rating || 0);
            const reviewCount = property.reviewCount || property.review_count || 0;
            const description = property.description || '';
            const amenities = Array.isArray(property.amenities) ? property.amenities : [];
            const image = Array.isArray(property.images) && property.images.length > 0
              ? property.images[0]
              : null;

            return (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="relative h-48 bg-gray-200">
                {image ? (
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-75"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HomeIcon className="w-16 h-16 text-white" />
                    </div>
                  </>
                )}
                <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg text-sm font-semibold text-gray-900">
                  ₱{price.toLocaleString()}/night
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{title}</h3>
                  <div className="flex items-center space-x-1 text-sm">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                    {reviewCount > 0 && <span className="text-gray-500">({reviewCount})</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-sm">{location}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{guests} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HomeIcon className="w-4 h-4" />
                    <span>{bedrooms} bed</span>
                  </div>
                  <span>{bathrooms} bath</span>
                </div>

                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{amenity}</span>
                    ))}
                    {amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">+{amenities.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    to={`/guest/units/${property.id}/reviews`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center block"
                  >
                    Reviews
                  </Link>
                  <Link
                    to={`/guest/units/${property.id}`}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or clearing some filters.</p>
            <button onClick={clearFilters} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-white py-12 mt-16" style={{backgroundColor: '#0C1805'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4" style={{color: '#4E7B22'}}>Smart Stay</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Your trusted platform for booking amazing properties with ease and confidence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/units" className="hover:text-white transition-colors">Browse Units</a></li>
                <li><a href="/recommendations" className="hover:text-white transition-colors">Recommendations</a></li>
                <li><a href="/faqs" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <p>Email: info@smartstay.com</p>
                <p>Phone: +1 (234) 567-8900</p>
                <p>Address: 123 Main St, City, State</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Smart Stay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Units;