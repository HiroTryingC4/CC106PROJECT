import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import PropertyReviews from '../../components/common/PropertyReviews';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import API_CONFIG from '../../config/api';

const PropertyReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/properties/${id}`);
        setProperty(response.data);
      } catch (err) {
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyInfo();
    }
  }, [id]);

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/guest/units/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Property</span>
        </button>

        {/* Property Header */}
        {!loading && property && (
          <div className="bg-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <p className="text-gray-600">{property.address?.fullAddress || 'Location unavailable'}</p>
          </div>
        )}

        {/* Reviews Component */}
        <PropertyReviews propertyId={id} />
      </div>
    </GuestLayout>
  );
};

export default PropertyReviewsPage;
