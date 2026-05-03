import React, { useState, useEffect } from 'react';
import { StarIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import API_CONFIG from '../../config/api';

const PropertyReviews = ({ propertyId, isHost = false, hostId = null }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingBreakdown: {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      checkIn: 0,
      value: 0
    }
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_CONFIG.BASE_URL}/reviews/property/${propertyId}`);
        setReviews(response.data.reviews || []);
        setStats({
          total: response.data.total || 0,
          averageRating: response.data.averageRating || 0,
          ratingBreakdown: response.data.ratingBreakdown || {
            cleanliness: 0,
            accuracy: 0,
            communication: 0,
            location: 0,
            checkIn: 0,
            value: 0
          }
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [propertyId]);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= Math.round(rating) ? (
            <StarIcon key={star} className="w-4 h-4 text-yellow-400" />
          ) : (
            <StarOutlineIcon key={star} className="w-4 h-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  const renderRatingBar = (label, value) => {
    const percentage = (value / 5) * 100;
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-700 w-32">{label}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-900 w-8">{value.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      // Try both localStorage and sessionStorage for token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to reply to reviews');
        setSubmittingReply(false);
        return;
      }
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/reviews/${reviewId}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the review in state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, hostReply: response.data.hostReply, hostReplyDate: response.data.hostReplyDate }
          : review
      ));

      setReplyingTo(null);
      setReplyText('');
      alert('Reply submitted successfully!');
    } catch (err) {
      console.error('Error submitting reply:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit reply';
      alert(errorMsg);
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg">
        <div className="text-center py-8 text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Photo Modal/Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ Close
            </button>
            <img
              src={selectedPhoto}
              alt="Checkout photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Reviews {stats.total > 0 && `(${stats.total})`}
      </h3>

      {stats.total === 0 ? (
        <div className="text-center py-12">
          <StarOutlineIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to review this property!</p>
        </div>
      ) : (
        <>
          {/* Overall Rating Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 pb-8 border-b">
            {/* Left: Overall Rating */}
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {renderStars(stats.averageRating)}
              </div>
              <p className="text-gray-600 text-sm">
                Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Right: Rating Breakdown */}
            <div className="space-y-3">
              {renderRatingBar('Cleanliness', stats.ratingBreakdown.cleanliness)}
              {renderRatingBar('Accuracy', stats.ratingBreakdown.accuracy)}
              {renderRatingBar('Communication', stats.ratingBreakdown.communication)}
              {renderRatingBar('Location', stats.ratingBreakdown.location)}
              {renderRatingBar('Check-in', stats.ratingBreakdown.checkIn)}
              {renderRatingBar('Value', stats.ratingBreakdown.value)}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">{review.guestName || `Guest #${review.guestId}`}</p>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{review.rating}.0</span>
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>

                {/* Checkout Photos */}
                {review.checkoutPhotos && review.checkoutPhotos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Checkout Photos</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {review.checkoutPhotos.map((photoUrl, idx) => (
                        <div 
                          key={idx} 
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedPhoto(photoUrl)}
                        >
                          <img
                            src={photoUrl}
                            alt={`Checkout ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">View Full</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Ratings */}
                {(review.cleanliness > 0 || review.accuracy > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 bg-gray-50 p-4 rounded-lg">
                    {review.cleanliness > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Cleanliness: </span>
                        <span className="font-medium text-gray-900">{review.cleanliness}/5</span>
                      </div>
                    )}
                    {review.accuracy > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Accuracy: </span>
                        <span className="font-medium text-gray-900">{review.accuracy}/5</span>
                      </div>
                    )}
                    {review.communication > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Communication: </span>
                        <span className="font-medium text-gray-900">{review.communication}/5</span>
                      </div>
                    )}
                    {review.location > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Location: </span>
                        <span className="font-medium text-gray-900">{review.location}/5</span>
                      </div>
                    )}
                    {review.checkIn > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Check-in: </span>
                        <span className="font-medium text-gray-900">{review.checkIn}/5</span>
                      </div>
                    )}
                    {review.value > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Value: </span>
                        <span className="font-medium text-gray-900">{review.value}/5</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Host Reply */}
                {review.hostReply && (
                  <div className="mt-4 ml-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-blue-900">Host Response</span>
                      <span className="text-xs text-blue-600">{formatDate(review.hostReplyDate)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.hostReply}</p>
                  </div>
                )}

                {/* Reply Button/Form for Host */}
                {isHost && hostId === review.hostId && !review.hostReply && (
                  <div className="mt-4">
                    {replyingTo === review.id ? (
                      <div className="ml-8">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your response..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          rows="3"
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleSubmitReply(review.id)}
                            disabled={submittingReply || !replyText.trim()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {submittingReply ? 'Submitting...' : 'Submit Reply'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            disabled={submittingReply}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="ml-8 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Reply to review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      </div>
    </>
  );
};

export default PropertyReviews;
