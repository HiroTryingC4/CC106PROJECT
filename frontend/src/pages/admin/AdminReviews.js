import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  StarIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AdminReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const reviews = [
    {
      id: 1,
      guest: 'John Doe',
      unit: 'Luxury Beachfront Condo',
      host: 'Jane Smith',
      rating: 5,
      comment: 'Amazing place! The view was spectacular and the host was very accommodating. Highly recommend!',
      date: '2024-03-15',
      status: 'published',
      flagged: false
    },
    {
      id: 2,
      guest: 'Sarah Wilson',
      unit: 'Modern City Apartment',
      host: 'Mike Johnson',
      rating: 2,
      comment: 'The place was not as described. Very noisy and dirty. Would not recommend.',
      date: '2024-03-14',
      status: 'flagged',
      flagged: true
    },
    {
      id: 3,
      guest: 'Alex Brown',
      unit: 'Cozy Mountain Cabin',
      host: 'Sarah Wilson',
      rating: 4,
      comment: 'Great location and cozy atmosphere. The cabin was clean and well-maintained.',
      date: '2024-03-13',
      status: 'published',
      flagged: false
    },
    {
      id: 4,
      guest: 'Emily Davis',
      unit: 'Beach House Villa',
      host: 'Alex Brown',
      rating: 1,
      comment: 'Terrible experience. The host was rude and the place was in poor condition.',
      date: '2024-03-12',
      status: 'pending',
      flagged: true
    },
    {
      id: 5,
      guest: 'Mike Johnson',
      unit: 'Downtown Loft',
      host: 'Emily Davis',
      rating: 5,
      comment: 'Perfect location for exploring the city. Clean, modern, and exactly as advertised.',
      date: '2024-03-11',
      status: 'published',
      flagged: false
    },
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const approveReview = (reviewId) => {
    console.log('Approving review:', reviewId);
  };

  const flagReview = (reviewId) => {
    console.log('Flagging review:', reviewId);
  };

  const deleteReview = (reviewId) => {
    console.log('Deleting review:', reviewId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reviews Management</h2>
          <p className="text-gray-600 mt-2">Monitor and moderate user reviews and ratings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">8,547</p>
            <p className="text-sm text-green-600 mt-1">+15% this month</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">4.6</p>
            <div className="flex mt-1">
              {renderStars(5)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">23</p>
            <p className="text-sm text-yellow-600 mt-1">Needs moderation</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Flagged Reviews</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">7</p>
            <p className="text-sm text-red-600 mt-1">Requires attention</p>
          </div>
        </div>
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by guest, unit, host, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {review.guest.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{review.guest}</h3>
                      <p className="text-sm text-gray-600">
                        Reviewed "{review.unit}" by {review.host}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                    {review.flagged && (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">View Details</span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  {review.status === 'pending' && (
                    <button 
                      onClick={() => approveReview(review.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  )}
                  {review.status === 'published' && !review.flagged && (
                    <button 
                      onClick={() => flagReview(review.id)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 flex items-center space-x-1"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Flag</span>
                    </button>
                  )}
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <StarIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;