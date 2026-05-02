import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';

const CheckoutPhotos = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiBaseUrl = API_CONFIG.BASE_URL;

  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [justSubmitted, setJustSubmitted] = useState(false);

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

        if (data.metadata?.checkoutPhotos?.length > 0) setSubmitted(true);

        const propRes = await fetch(`${apiBaseUrl}/properties/${data.propertyId}`, {
          credentials: 'include'
        });
        if (propRes.ok) setProperty(await propRes.json());
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, apiBaseUrl, token]);

  const handleFileSelect = (files) => {
    const valid = Array.from(files).filter(
      (f) => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size <= 5 * 1024 * 1024
    );
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

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please upload at least one photo');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append('photos', f));

      const res = await fetch(`${apiBaseUrl}/bookings/${bookingId}/checkout-photos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setUploadedUrls(data.urls || []);
      setSubmitted(true);
      setJustSubmitted(true);
      setSelectedFiles([]);
    } catch (err) {
      alert(err.message || 'Failed to upload photos');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <GuestLayout>
        <div className="p-6 text-gray-600">Loading booking details...</div>
      </GuestLayout>
    );
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
        <button
          onClick={() => navigate(`/guest/bookings/${bookingId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout Photos</h1>
          <p className="text-gray-600 mt-1">Upload photos of the unit before checkout</p>
        </div>

        {justSubmitted && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos Submitted!</h2>
              <p className="text-gray-600">Your checkout photos have been successfully uploaded for Booking #{booking.id}.</p>
            </div>
            {uploadedUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                {uploadedUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Checkout photo ${i + 1}`} className="w-full h-28 object-cover rounded-lg" />
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(`/guest/bookings/${bookingId}`)}
                className="px-6 py-3 text-white rounded-lg font-medium hover:opacity-90"
                style={{ backgroundColor: '#4E7B22' }}
              >
                Back to Booking
              </button>
              <button
                onClick={() => navigate('/guest/bookings')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                View All Bookings
              </button>
            </div>
          </div>
        )}

        {!justSubmitted && submitted && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg font-medium">
            ✓ Checkout photos have already been submitted for this booking.
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${justSubmitted ? 'hidden' : ''}`}>
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Photo Guidelines</h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• Take clear photos of all rooms</li>
                <li>• Include photos of any existing damages</li>
                <li>• Capture the overall cleanliness of the unit</li>
                <li>• Maximum 5 photos allowed</li>
                <li>• Accepted formats: JPG, PNG (max 5MB each)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Click to upload photos</h4>
                    <p className="text-gray-600 text-sm">{selectedFiles.length}/5 photos selected</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
                    style={{ backgroundColor: '#4E7B22' }}
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Selected Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedFiles.length === 0}
                  className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#4E7B22' }}
                >
                  {submitting ? 'Uploading...' : 'Submit Checkout Photos'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
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
                  <p className="text-gray-600 text-sm mb-1">Check-out Date</p>
                  <p className="text-gray-900 font-medium">{formatDate(booking.checkOut)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why upload photos?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Checkout photos help protect your security deposit by documenting the condition of the unit when you leave. This ensures a fair assessment and quick refund process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};


export default CheckoutPhotos;
