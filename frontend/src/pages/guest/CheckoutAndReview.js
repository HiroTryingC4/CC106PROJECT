import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CameraIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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

const CheckoutAndReview = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Photo states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [photosSubmitted, setPhotosSubmitted] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  // Review states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [subRatings, setSubRatings] = useState({ cleanliness: 0, accuracy: 0, communication: 0, location: 0, checkIn: 0, value: 0 });
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [allComplete, setAllComplete] = useState(false);

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

        if (data.metadata?.checkoutPhotos?.length > 0) {
          setPhotosSubmitted(true);
          setUploadedUrls(data.metadata.checkoutPhotos);
        }

        const propRes = await fetch(`${apiBaseUrl}/properties/${data.propertyId}`, { credentials: 'include' });
        if (propRes.ok) setProperty(await propRes.json());

        const revRes = await fetch(`${apiBaseUrl}/reviews?propertyId=${data.propertyId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          const myReview = (revData.reviews || []).find((r) => r.bookingId === data.id || r.bookingId === parseInt(bookingId, 10));
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

  const handleFileSelect = (files) => {
    const valid = Array.from(files).filter((f) => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size <= 5 * 1024 * 1024);
    if (selectedFiles.length + valid.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index) => setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmitAll = async () => {
    // Validate photos
    if (!canUploadPhotos) {
      alert('Checkout photos can only be uploaded after your checkout date for confirmed bookings.');
      return;
    }
    
    if (!photosSubmitted && selectedFiles.length === 0) {
      alert('Please upload at least one checkout photo');
      return;
    }

    // Validate review
    if (!canReview) {
      // If only uploading photos, skip review validation
      if (photosSubmitted || selectedFiles.length === 0) {
        alert('Reviews can only be submitted for completed bookings.');
        return;
      }
    } else {
      if (!alreadyReviewed && rating === 0) {
        alert('Please select an overall rating');
        return;
      }
      if (!alreadyReviewed && !comment.trim()) {
        alert('Please write a review comment');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Upload photos if not already submitted
      if (!photosSubmitted && selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((f) => formData.append('photos', f));

        const photoRes = await fetch(`${apiBaseUrl}/bookings/${bookingId}/checkout-photos`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          body: formData
        });

        const photoData = await photoRes.json();
        if (!photoRes.ok) throw new Error(photoData.message || 'Photo upload failed');
        setUploadedUrls(photoData.urls || []);
        setPhotosSubmitted(true);
      }

      // Submit review if not already reviewed and booking is completed
      if (!alreadyReviewed && canReview) {
        const reviewRes = await fetch(`${apiBaseUrl}/reviews`, {
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
        const reviewData = await reviewRes.json();
        if (!reviewRes.ok) throw new Error(reviewData.message || 'Review submission failed');
      }

      setAllComplete(true);
    } catch (err) {
      alert(err.message || 'Submission failed');
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

  // Check if booking is completed
  const isCompleted = booking.status === 'completed';
  const isConfirmed = booking.status === 'confirmed';
  const checkoutDate = new Date(booking.checkOut);
  const today = new Date();
  const isPastCheckout = today > checkoutDate;
  
  const canUploadPhotos = (isConfirmed || isCompleted) && isPastCheckout;
  const canReview = isCompleted;

  const formatDate = (v) => new Date(v).toLocaleDateString('en-PH');

  return (
    <GuestLayout>
      <div className="space-y-6">
        <button onClick={() => navigate(`/guest/bookings/${bookingId}`)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout & Review</h1>
          <p className="text-gray-600 mt-1">Upload photos and share your experience</p>
          {!canUploadPhotos && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
              ⚠️ Checkout photos can only be uploaded after your checkout date for confirmed bookings. Current status: <span className="font-semibold">{booking.status}</span>
            </div>
          )}
          {!isCompleted && canUploadPhotos && (
            <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg text-sm">
              ℹ️ Reviews can only be submitted after the booking is marked as completed by the host.
            </div>
          )}
        </div>

        {/* Success Screen */}
        {allComplete && (
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
              <p className="text-gray-600">Your checkout photos and review have been successfully submitted for Booking #{booking.id}.</p>
            </div>

            {/* Review Summary */}
            {rating > 0 && (
              <div className="border-t border-b border-gray-200 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Your Review</h3>
                <div className="flex justify-center mb-3 space-x-1">
                  {[1,2,3,4,5].map((s) => (s <= rating ? <StarSolid key={s} className="w-8 h-8 text-yellow-400" /> : <StarIcon key={s} className="w-8 h-8 text-gray-300" />))}
                </div>
                <p className="text-center text-gray-600 text-sm mb-4">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>
                {comment && (
                  <div className="bg-gray-50 rounded-lg p-4 max-w-2xl mx-auto">
                    <p className="text-gray-700 text-sm italic">"{comment}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Checkout Photos */}
            {uploadedUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Checkout Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uploadedUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img 
                        src={url} 
                        alt={`Checkout ${i + 1}`} 
                        className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" 
                        onClick={() => window.open(url, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">View Full Size</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button onClick={() => navigate(`/guest/bookings/${bookingId}`)} className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90" style={{ backgroundColor: '#4E7B22' }}>
                Back to Booking
              </button>
              <button onClick={() => navigate('/guest/bookings')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                View All Bookings
              </button>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${allComplete ? 'hidden' : ''}`}>
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Checkout Photos Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Checkout Photos</h3>
                {photosSubmitted && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">✓ Submitted</span>}
                {!canUploadPhotos && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Locked</span>}
              </div>

              {!canUploadPhotos ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">⚠️ Checkout Photos Not Available</p>
                  <p>You can only upload checkout photos after:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your booking is <span className="font-semibold">confirmed</span> by the host</li>
                    <li>Your checkout date has passed</li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-xs">Current status: <span className="font-semibold">{booking.status}</span></p>
                    <p className="text-xs">Checkout date: <span className="font-semibold">{formatDate(booking.checkOut)}</span></p>
                    {!isPastCheckout && <p className="text-xs mt-1">⏳ Checkout photos will be available after {formatDate(booking.checkOut)}</p>}
                  </div>
                </div>
              ) : photosSubmitted ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                    ✓ Checkout photos already submitted
                  </div>
                  {uploadedUrls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{uploadedUrls.length} photo{uploadedUrls.length > 1 ? 's' : ''} uploaded</p>
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img 
                              src={url} 
                              alt={`Checkout ${i + 1}`} 
                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                              onClick={() => window.open(url, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-xs">View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-green-700 text-sm">Upload 1-5 photos (JPG/PNG, max 5MB each)</p>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CameraIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">{selectedFiles.length}/5 photos selected</p>
                      <input type="file" multiple accept="image/jpeg,image/png" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className="cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#4E7B22' }}>
                        Choose Files
                      </label>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Photos ({selectedFiles.length})</p>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                            <button onClick={() => removeFile(index)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Review Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Leave a Review</h3>
                {alreadyReviewed && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">✓ Submitted</span>}
                {!canReview && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Locked</span>}
              </div>

              {!canReview ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-2">⚠️ Review Not Available</p>
                  <p>You can only leave a review after the booking is marked as <span className="font-semibold">completed</span> by the host.</p>
                  <p className="mt-2 text-xs">Current booking status: <span className="font-semibold">{booking.status}</span></p>
                </div>
              ) : alreadyReviewed ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
                  ✓ You have already submitted a review for this booking
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Overall Rating */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Overall Rating *</p>
                    <div className="flex items-center space-x-3">
                      <StarPicker value={rating} onChange={setRating} />
                      {rating > 0 && <span className="text-gray-600 text-sm font-medium">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
                    </div>
                  </div>

                  {/* Sub-ratings */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Rate Your Experience</p>
                    <div className="grid grid-cols-2 gap-4">
                      {SUB_RATINGS.map(({ key, label }) => (
                        <div key={key}>
                          <p className="text-xs text-gray-600 mb-1">{label}</p>
                          <StarPicker value={subRatings[key]} onChange={(v) => setSubRatings((prev) => ({ ...prev, [key]: v }))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Review *</p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      placeholder="Share your experience with this property..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{comment.length} characters</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitAll}
              disabled={submitting || (!canUploadPhotos && !photosSubmitted) || (photosSubmitted && alreadyReviewed)}
              className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#4E7B22' }}
            >
              {submitting ? 'Submitting...' : 
               (photosSubmitted && alreadyReviewed) ? 'All Submitted' : 
               (!canUploadPhotos && !photosSubmitted) ? 'Locked (Not Available Yet)' :
               (photosSubmitted && !canReview) ? 'Photos Submitted (Review Locked)' :
               'Submit All'}
            </button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Booking Status</p>
                  <p className={`text-sm font-semibold ${
                    booking.status === 'completed' ? 'text-blue-600' :
                    booking.status === 'confirmed' ? 'text-green-600' :
                    booking.status === 'pending' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Booking ID</p>
                  <p className="text-gray-900 font-medium text-sm">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Unit</p>
                  <p className="text-gray-900 font-medium text-sm">{property?.title || booking.propertyTitle || 'Property'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Check-in</p>
                  <p className="text-gray-900 font-medium text-sm">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Check-out</p>
                  <p className="text-gray-900 font-medium text-sm">{formatDate(booking.checkOut)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 text-sm mb-2">Guidelines</h3>
              <ul className="space-y-1 text-green-700 text-xs">
                <li>• Upload clear photos of all rooms</li>
                <li>• Be honest and specific in your review</li>
                <li>• Focus on your personal experience</li>
                <li>• Keep feedback respectful</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default CheckoutAndReview;
