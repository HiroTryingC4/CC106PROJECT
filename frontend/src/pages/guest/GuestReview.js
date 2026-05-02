import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const SUB_RATINGS = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
  { key: 'checkIn', label: 'Check-in' },
  { key: 'value', label: 'Value' },
];

const StarPicker = ({ value, onChange }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)}>
        {star <= value
          ? <StarSolid className="w-6 h-6 text-yellow-400" />
          : <StarIcon className="w-6 h-6 text-gray-300 hover:text-yellow-300" />}
      </button>
    ))}
  </div>
);

const GuestReview = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [subRatings, setSubRatings] = useState({ cleanliness: 0, accuracy: 0, communication: 0, location: 0, checkIn: 0, value: 0 });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/bookings/${bookingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to load booking');
        const data = await res.json();
        setBooking(data);

        const propRes = await fetch(`${apiBaseUrl}/properties/${data.propertyId}`, { credentials: 'include' });
        if (propRes.ok) setProperty(await propRes.json());

        // Check if already reviewed
        const revRes = await fetch(`${apiBaseUrl}/reviews?propertyId=${data.propertyId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          const myReview = (revData.reviews || []).find(
            (r) => r.bookingId === data.id || r.bookingId === parseInt(bookingId, 10)
          );
          if (myReview) setAlreadyReviewed(true);
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, apiBaseUrl, token]);

  const handleSubmit = async () => {
    if (rating === 0) { alert('Please select an overall rating'); return; }
    if (!comment.trim()) { alert('Please write a comment'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: booking.propertyId,
          bookingId: booking.id,
          hostId: booking.hostId,
          rating,
          comment: comment.trim(),
          cleanliness: subRatings.cleanliness,
          accuracy: subRatings.accuracy,
          communication: subRatings.communication,
          location: subRatings.location,
          checkIn: subRatings.checkIn,
          value: subRatings.value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setJustSubmitted(true);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <GuestLayout><div className="p-6 text-gray-600">Loading booking details...</div></GuestLayout>;
  }

  if (error || !booking) {
    return (
      <GuestLayout>
        <div className="p-6 space-y-4">
          <button onClick={() => navigate(`/guest/bookings/${bookingId}`)} className="text-gray-600 hover:text-gray-800">Back</button>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error || 'Booking not found'}</div>
        </div>
      </GuestLayout>
    );
  }

  const formatDate = (v) => new Date(v).toLocaleDateString('en-PH');

  return (
    <GuestLayout>
      <div className="space-y-6">
        <button onClick={() => navigate(`/guest/bookings/${bookingId}`)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave a Review</h1>
          <p className="text-gray-600 mt-1">Share your experience with this property</p>
        </div>

        {/* Success screen */}
        {justSubmitted && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
              <p className="text-gray-600">Thank you for your feedback on <span className="font-medium">{property?.title || booking.propertyTitle}</span>.</p>
              <div className="flex justify-center mt-3 space-x-1">
                {[1,2,3,4,5].map((s) => (
                  s <= rating
                    ? <StarSolid key={s} className="w-6 h-6 text-yellow-400" />
                    : <StarIcon key={s} className="w-6 h-6 text-gray-300" />
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate(`/guest/bookings/${bookingId}`)} className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90" style={{ backgroundColor: '#4E7B22' }}>
                Back to Booking
              </button>
              <button onClick={() => navigate('/guest/bookings')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                View All Bookings
              </button>
            </div>
          </div>
        )}

        {/* Already reviewed banner */}
        {!justSubmitted && alreadyReviewed && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg font-medium">
            ✓ You have already submitted a review for this booking.
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${justSubmitted ? 'hidden' : ''}`}>
          {/* Left Column - Review Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overall Rating */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h3>
              <div className="flex items-center space-x-4">
                <StarPicker value={rating} onChange={setRating} />
                {rating > 0 && <span className="text-gray-600 text-sm">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
              </div>
            </div>

            {/* Sub-ratings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {SUB_RATINGS.map(({ key, label }) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                    <StarPicker value={subRatings[key]} onChange={(v) => setSubRatings((prev) => ({ ...prev, [key]: v }))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Review</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="Tell others about your stay — what did you love, what could be improved?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{comment.length} characters</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || alreadyReviewed || rating === 0}
              className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#4E7B22' }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          {/* Right Column - Booking Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Booking ID</p>
                  <p className="text-gray-900 font-medium">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Unit</p>
                  <p className="text-gray-900 font-medium">{property?.title || booking.propertyTitle || 'Property'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Check-in</p>
                  <p className="text-gray-900 font-medium">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Check-out</p>
                  <p className="text-gray-900 font-medium">{formatDate(booking.checkOut)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Review Guidelines</h3>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Be honest and specific</li>
                <li>• Focus on your personal experience</li>
                <li>• Mention both positives and areas to improve</li>
                <li>• Keep it respectful and constructive</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestReview;
