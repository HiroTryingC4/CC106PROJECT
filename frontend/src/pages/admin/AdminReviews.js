import React, { useState, useEffect } from 'react';
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
import API_CONFIG from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReviews = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    flaggedReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/reviews`, {
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);
      setStats(data.stats);
      setError('');
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.guest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.host?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const deleteReview = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/reviews/${reviewToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Refresh reviews list
      await fetchReviews();
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const viewReviewDetails = (review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReview(null);
  };

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = paginateData(filteredReviews);

  return (
    <AdminLayout>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && reviewToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-center text-xl font-semibold text-gray-900">
              Delete Review?
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {renderStars(reviewToDelete.rating)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{reviewToDelete.rating}/5</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  By: {reviewToDelete.guest || 'Unknown Guest'}
                </p>
                <p className="text-xs text-gray-600">Property: {reviewToDelete.unit || 'Unknown Property'}</p>
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">{reviewToDelete.comment}</p>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800 font-medium flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>This action cannot be undone. The review will be permanently deleted from the system.</span>
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReviewToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-medium text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Reviews Management</h2>
          <p className="mt-2 text-gray-600">Monitor and moderate user reviews and ratings</p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading reviews..." />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReviews.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">All time</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.averageRating}</p>
                <div className="flex mt-1">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingReviews}</p>
                <p className="text-sm text-yellow-600 mt-1">Needs moderation</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-medium text-gray-500">Flagged Reviews</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.flaggedReviews}</p>
                <p className="text-sm text-red-600 mt-1">Requires attention</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews by guest, unit, host, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-2 sm:gap-0">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="rounded-xl border border-gray-300 px-3 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                    className="rounded-xl border border-gray-300 px-3 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
              {paginatedReviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-start gap-3 sm:items-center sm:gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                          <span className="text-white text-sm font-medium">
                            {review.guest?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">{review.guest || 'Unknown Guest'}</h3>
                          <p className="text-sm text-gray-600">
                            Reviewed "{review.unit || 'Unknown Property'}" by {review.host || 'Unknown Host'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3 flex flex-wrap items-center gap-2">
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

                  <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => viewReviewDetails(review)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                    </div>
                    
                    <div className="flex">
                      <button 
                        onClick={() => deleteReview(review.id)}
                        className="inline-flex items-center space-x-1 rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 p-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}

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
          </>
        )}

        {/* Review Details Modal */}
        {showDetailsModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <div className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-white sm:h-auto sm:max-h-[90vh] sm:rounded-[28px]">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                    <StarIcon className="h-6 w-6 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Review Details</h3>
                    <p className="text-sm text-gray-600">Complete review information</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-500 transition hover:bg-white hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Rating Section - Prominent */}
                  <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 p-6 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Overall Rating</p>
                        <div className="flex items-center space-x-3">
                          <div className="flex">
                            {renderStars(selectedReview.rating)}
                          </div>
                          <span className="text-4xl font-bold text-gray-900">{selectedReview.rating}</span>
                          <span className="text-2xl text-gray-500">/5</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedReview.status)}`}>
                          {selectedReview.status}
                        </span>
                        {selectedReview.flagged && (
                          <div className="mt-2 flex items-center justify-end text-red-600 text-sm font-medium">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                            Flagged
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Guest & Property Info - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Guest Info */}
                    <div className="rounded-2xl bg-blue-50 p-5 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {selectedReview.guest?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Guest</p>
                          <p className="font-bold text-gray-900 text-lg">{selectedReview.guest || 'Unknown Guest'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600"><span className="font-medium">ID:</span> #{selectedReview.guestId}</p>
                      </div>
                    </div>

                    {/* Host Info */}
                    <div className="rounded-2xl bg-purple-50 p-5 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {selectedReview.host?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Host</p>
                          <p className="font-bold text-gray-900 text-lg">{selectedReview.host || 'Unknown Host'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600"><span className="font-medium">ID:</span> #{selectedReview.hostId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="rounded-2xl bg-green-50 p-5 border border-green-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-600 shadow-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Property</p>
                        <p className="font-bold text-gray-900 text-lg mb-1">{selectedReview.unit || 'Unknown Property'}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Property ID:</span> #{selectedReview.propertyId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="rounded-2xl bg-gray-50 p-6 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Review Comment</h4>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="rounded-xl bg-white p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Review Date</h4>
                      </div>
                      <p className="text-gray-900 font-medium">{new Date(selectedReview.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-sm text-gray-500">{new Date(selectedReview.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    {/* Booking ID */}
                    {selectedReview.bookingId && (
                      <div className="rounded-xl bg-white p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Booking ID</h4>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">#{selectedReview.bookingId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="flex-1 sm:flex-none rounded-2xl border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeDetailsModal();
                    deleteReview(selectedReview.id);
                  }}
                  className="flex-1 sm:flex-none rounded-2xl bg-red-600 px-6 py-3 font-medium text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <TrashIcon className="w-5 h-5" />
                  <span>Delete Review</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
