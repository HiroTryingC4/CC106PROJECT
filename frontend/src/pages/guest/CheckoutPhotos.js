import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuestLayout from '../../components/common/GuestLayout';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';

const CheckoutPhotos = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Sample booking data - in real app this would come from API
  const booking = {
    id: '#39',
    unit: 'Unit #1',
    checkOutDate: '03/30/2026',
    securityDeposit: '₱200'
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (selectedFiles.length + validFiles.length <= 5) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      alert('Maximum 5 photos allowed');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert('Please upload at least one photo');
      return;
    }
    // In real app, this would upload files to server
    alert('Checkout photos submitted successfully!');
    navigate(`/guest/bookings/${bookingId}`);
  };

  return (
    <GuestLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/guest/bookings/${bookingId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout Photos</h1>
          <p className="text-gray-600 mt-1">Upload photos of the unit before checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Guidelines */}
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

            {/* Upload Area */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>
              
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
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
                    onChange={handleFileInput}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer text-white px-6 py-2 rounded-lg font-medium hover:opacity-90"
                    style={{backgroundColor: '#4E7B22'}}
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              {/* Selected Photos Preview */}
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

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90"
                  style={{backgroundColor: '#4E7B22'}}
                >
                  Submit Checkout Photos
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Info */}
          <div className="space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Booking ID</p>
                  <p className="text-gray-900 font-medium">{booking.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Unit</p>
                  <p className="text-gray-900 font-medium">{booking.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Check-out Date</p>
                  <p className="text-gray-900 font-medium">{booking.checkOutDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Security Deposit</p>
                  <p className="text-gray-900 font-medium">{booking.securityDeposit}</p>
                </div>
              </div>
            </div>

            {/* Why Upload Photos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why upload photos?</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Checkout photos help protect your security deposit by documenting the condition of the unit when you leave. This ensures a fair assessment and quick refund process.
              </p>
            </div>
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

export default CheckoutPhotos;