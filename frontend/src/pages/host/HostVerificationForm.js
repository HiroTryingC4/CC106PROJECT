import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CameraIcon,
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  CheckCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const HostVerificationForm = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Individual',
    businessAddress: '',
    idType: 'Passport',
    idNumber: '',
    taxId: '',
    proofOfOwnership: null,
    additionalDocuments: null,
    idDocumentPhoto: null,
    ownerHoldingIdPhoto: null
  });
  const [customIdType, setCustomIdType] = useState('');
  const [imagePreviews, setImagePreviews] = useState({
    idDocumentPhoto: null,
    ownerHoldingIdPhoto: null,
    proofOfOwnership: null,
    additionalDocuments: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // Fetch user data and verification status on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        
        // Pre-fill with company name from registration
        if (user.company) {
          setFormData(prev => ({
            ...prev,
            businessName: user.company
          }));
        }

        // Fetch verification status and existing data
        if (token) {
          const response = await fetch('http://localhost:5000/api/host/verification-status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const statusData = await response.json();
            setVerificationStatus(statusData);
            
            // If there's existing verification data, populate the form
            if (statusData.data) {
              const data = statusData.data;
              const predefinedIdTypes = ['Passport', "Driver's License", 'National ID', 'State ID'];
              const isCustomIdType = !predefinedIdTypes.includes(data.idType);
              
              setFormData(prev => ({
                ...prev,
                businessName: data.businessName || prev.businessName,
                businessType: data.businessType || prev.businessType,
                businessAddress: data.businessAddress || prev.businessAddress,
                idType: isCustomIdType ? 'Other' : (data.idType || prev.idType),
                idNumber: data.idNumber || prev.idNumber,
                taxId: data.taxId || prev.taxId
              }));
              
              // Set custom ID type if it's a custom value
              if (isCustomIdType) {
                setCustomIdType(data.idType);
              }
              
              // Log the fetched data for debugging
              console.log('Fetched verification data:', data);
              
              // Set form to read-only mode if status is pending
              setIsEditing(statusData.status !== 'pending');
            } else {
              console.log('No existing verification data found');
              setIsEditing(true); // New submission
            }
          }
        }
      } catch (error) {
        console.error('Error fetching verification data:', error);
        setIsEditing(true); // Default to editing mode on error
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cleanup debounce timer on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Poll for verification status changes every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/host/verification-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const statusData = await response.json();
          setVerificationStatus(statusData);
          console.log('Verification status updated:', statusData.status);
        }
      } catch (error) {
        console.error('Error polling verification status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Address search function using OpenStreetMap Nominatim API
  const searchAddresses = async (query) => {
    if (query.length < 3) {
      setAddressSearchResults([]);
      setShowAddressDropdown(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'SmartStay-App'
          }
        }
      );
      const results = await response.json();
      setAddressSearchResults(results);
      setShowAddressDropdown(results.length > 0);
    } catch (error) {
      console.error('Error searching addresses:', error);
      setAddressSearchResults([]);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Handle address search input change with debounce
  const handleAddressSearch = (e) => {
    const query = e.target.value;
    setAddressSearchQuery(query);
    
    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Only search if query has content and is not just whitespace
    if (query.trim().length === 0) {
      setAddressSearchResults([]);
      setShowAddressDropdown(false);
      return;
    }
    
    // Set new debounce timer - search after 500ms of inactivity
    debounceTimer.current = setTimeout(() => {
      searchAddresses(query);
    }, 500);
  };

  // Handle address selection from search results
  const handleSelectAddress = (result) => {
    const fullAddress = result.display_name;
    setFormData(prev => ({
      ...prev,
      businessAddress: fullAddress
    }));
    setSelectedAddressData({
      address: fullAddress,
      latitude: result.lat,
      longitude: result.lon,
      displayName: result.display_name
    });
    setAddressSearchQuery('');
    setAddressSearchResults([]);
    setShowAddressDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create image preview for image files
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => ({
            ...prev,
            [name]: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else if (file) {
        // For non-image files, just show file name
        setImagePreviews(prev => ({
          ...prev,
          [name]: file.name
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleSkip = () => {
    // Navigate directly to host dashboard without submitting verification
    navigate('/host/dashboard');
  };

  const handleViewFile = (fileInfo, fileType) => {
    if (fileInfo && fileInfo.fileId) {
      if (fileInfo.mimetype?.startsWith('image/')) {
        // For images, show in image modal with actual image
        setSelectedImage({
          name: fileInfo.originalName,
          type: fileType,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          fileId: fileInfo.fileId
        });
        setShowImageModal(true);
      } else {
        // For documents, show in document modal
        setSelectedDocument({
          name: fileInfo.originalName,
          type: fileType,
          size: fileInfo.size,
          mimetype: fileInfo.mimetype,
          fileId: fileInfo.fileId
        });
        setShowDocumentModal(true);
      }
    } else {
      // Fallback for old implementation
      alert(`Document: ${fileInfo?.originalName || 'Unknown'}\\nSize: ${fileInfo?.size ? (fileInfo.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}\\nType: ${fileInfo?.mimetype || 'Unknown'}\\n\\nNote: File preview not available for this submission.`);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create JSON payload (not FormData)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User from localStorage:', user);
      
      // Construct host name from available data
      let hostName = '';
      if (user.firstName && user.lastName) {
        hostName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstName) {
        hostName = user.firstName;
      } else if (user.lastName) {
        hostName = user.lastName;
      } else if (user.fullName) {
        hostName = user.fullName;
      } else if (user.name) {
        hostName = user.name;
      }
      
      const submitData = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessAddress: formData.businessAddress,
        idType: formData.idType,
        idNumber: formData.idNumber,
        taxId: formData.taxId,
        email: user.email || '', // Include user's email
        hostName: hostName // Include host name
        // Note: File uploads will be handled separately in future updates
      };

      console.log('Submitting verification data...', submitData);
      
      const response = await fetch('http://localhost:5000/api/host/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user verification status in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.verificationStatus = 'pending';
        localStorage.setItem('user', JSON.stringify(user));
        
        // Show success modal
        setSuccessMessage('Your verification documents have been submitted successfully!');
        setShowSuccessModal(true);
        setRedirectCountdown(5);
        
        // Auto redirect after 5 seconds
        let countdown = 5;
        const countdownTimer = setInterval(() => {
          countdown--;
          setRedirectCountdown(countdown);
          if (countdown === 0) {
            clearInterval(countdownTimer);
            navigate('/host/dashboard');
          }
        }, 1000);
      } else {
        setError(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBanner = () => {
    if (!verificationStatus) return null;

    const { status, submittedAt } = verificationStatus;

    if (status === 'pending') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 mb-1">Verification Under Review</h3>
              <p className="text-sm text-blue-700 mb-3">
                Your verification documents were submitted on {new Date(submittedAt).toLocaleDateString()} and are currently being reviewed by our team.
              </p>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit Submission
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  onClick={() => navigate('/host/dashboard')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Image Modal Component
  const ImageModal = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    // Load image with authentication
    useEffect(() => {
      if (showImageModal && selectedImage && selectedImage.fileId) {
        const token = localStorage.getItem('token');
        const url = `http://localhost:5000/api/files/${selectedImage.fileId}`;
        
        setImageLoading(true);
        setImageError(false);
        
        fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to load image');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          setImageUrl(blobUrl);
          setImageLoading(false);
        })
        .catch(error => {
          console.error('Error loading image:', error);
          setImageError(true);
          setImageLoading(false);
        });
      } else {
        setImageLoading(false);
      }

      // Cleanup blob URL when modal closes
      return () => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      };
    }, [showImageModal, selectedImage?.fileId, imageUrl]);

    if (!showImageModal || !selectedImage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedImage.name}</h3>
              <p className="text-sm text-gray-600">
                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB • {selectedImage.mimetype}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {selectedImage.fileId && (
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    const url = `http://localhost:5000/api/files/${selectedImage.fileId}`;
                    
                    fetch(url, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      const blobUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = selectedImage.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(blobUrl);
                    })
                    .catch(error => {
                      console.error('Error downloading file:', error);
                      alert('Error downloading file. Please try again.');
                    });
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-4 max-h-[70vh] overflow-auto">
            <div className="text-center">
              {imageLoading ? (
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium mb-2">Loading Image...</p>
                  <p className="text-gray-500 text-sm">Please wait while we load your image.</p>
                </div>
              ) : imageUrl && !imageError ? (
                <img 
                  src={imageUrl}
                  alt={selectedImage.name}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">Image Preview</p>
                  <p className="text-gray-500 text-sm">
                    {imageError ? 'Failed to load image. Please try again.' : 'Image preview not available for this submission.'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    File: {selectedImage.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Document Modal Component
  const DocumentModal = () => {
    const [documentUrl, setDocumentUrl] = useState(null);
    const [documentLoading, setDocumentLoading] = useState(true);
    const [documentError, setDocumentError] = useState(false);

    // Load document with authentication
    useEffect(() => {
      if (showDocumentModal && selectedDocument && selectedDocument.fileId) {
        const token = localStorage.getItem('token');
        const url = `http://localhost:5000/api/files/${selectedDocument.fileId}`;
        
        setDocumentLoading(true);
        setDocumentError(false);
        
        fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to load document');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          setDocumentUrl(blobUrl);
          setDocumentLoading(false);
        })
        .catch(error => {
          console.error('Error loading document:', error);
          setDocumentError(true);
          setDocumentLoading(false);
        });
      } else {
        setDocumentLoading(false);
      }

      // Cleanup blob URL when modal closes
      return () => {
        if (documentUrl) {
          URL.revokeObjectURL(documentUrl);
        }
      };
    }, [showDocumentModal, selectedDocument?.fileId, documentUrl]);

    if (!showDocumentModal || !selectedDocument) return null;

    const handleDownload = () => {
      if (documentUrl) {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = selectedDocument.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const handleViewInNewTab = () => {
      if (documentUrl) {
        window.open(documentUrl, '_blank');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedDocument.name}</h3>
              <p className="text-sm text-gray-600">
                {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB • {selectedDocument.mimetype}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {documentUrl && (
                <>
                  <button
                    onClick={handleViewInNewTab}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Open in New Tab"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-4 max-h-[70vh] overflow-auto">
            <div className="text-center">
              {documentLoading ? (
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium mb-2">Loading Document...</p>
                  <p className="text-gray-500 text-sm">Please wait while we load your document.</p>
                </div>
              ) : documentUrl && !documentError ? (
                <div className="space-y-4">
                  {selectedDocument.mimetype === 'application/pdf' ? (
                    <iframe
                      src={documentUrl}
                      className="w-full h-[60vh] border rounded-lg"
                      title={selectedDocument.name}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8">
                      <div className="text-blue-500 mb-4">
                        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-lg font-medium mb-2">Document Ready</p>
                      <p className="text-gray-500 text-sm mb-4">
                        Click "Open in New Tab" to view or "Download" to save the document.
                      </p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={handleViewInNewTab}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Open in New Tab
                        </button>
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">Document Preview</p>
                  <p className="text-gray-500 text-sm">
                    {documentError ? 'Failed to load document. Please try again.' : 'Document preview not available for this submission.'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    File: {selectedDocument.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Success Icon with Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                <div className="relative bg-green-500 rounded-full p-4 flex items-center justify-center">
                  <CheckIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
              <p className="text-gray-600">{successMessage}</p>
              <p className="text-sm text-gray-500">Please wait for admin approval before you can list properties.</p>
            </div>

            {/* Status Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-900">What happens next?</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Our team will review your documents
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  You'll receive an email notification
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  Usually approved within 24-48 hours
                </li>
              </ul>
            </div>

            {/* Countdown */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Redirecting to dashboard in <span className="font-semibold text-green-600">{redirectCountdown}</span> seconds...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(redirectCountdown / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => navigate('/host/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      )}

      {/* Full Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/BG-IMAGE.png')",
        }}
      ></div>

      {/* Optional overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Center the form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate('/host/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {verificationStatus?.status === 'pending' ? 'Verification Status' : 'Host Verification'}
            </h1>
            <p className="text-gray-600 mt-2">
              {verificationStatus?.status === 'pending' 
                ? 'Review your submitted verification documents' 
                : 'Complete your verification to unlock all host features'
              }
            </p>
          </div>

          {/* Status Banner */}
          <div className="px-8">
            {getStatusBanner()}
          </div>

          {/* Submitted Information Summary - Show when not editing */}
          {verificationStatus?.data && !isEditing && (
            <div className="mx-8 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Submitted Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Information */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Business Name:</span>
                        <span className="ml-2 font-medium">{verificationStatus.data.businessName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Business Type:</span>
                        <span className="ml-2 font-medium">{verificationStatus.data.businessType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <span className="ml-2 font-medium">{verificationStatus.data.businessAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Identification */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Identification</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">ID Type:</span>
                        <span className="ml-2 font-medium">{verificationStatus.data.idType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ID Number:</span>
                        <span className="ml-2 font-medium">{verificationStatus.data.idNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tax ID:</span>
                        <span className="ml-2 font-medium">{verificationStatus.data.taxId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Access to Documents */}
                {verificationStatus.data.files && Object.keys(verificationStatus.data.files).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3">Quick Access to Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(verificationStatus.data.files).map(([key, file]) => {
                        const fileLabels = {
                          idDocumentPhoto: 'ID Document Photo',
                          ownerHoldingIdPhoto: 'Owner Holding ID Photo',
                          proofOfOwnership: 'Proof of Ownership',
                          additionalDocuments: 'Additional Documents'
                        };
                        
                        return (
                          <button
                            key={key}
                            onClick={() => handleViewFile(file, fileLabels[key])}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            {fileLabels[key]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Benefits Section - Only show for new submissions */}
          {(!verificationStatus?.data || isEditing) && (
            <div className="mx-8 mb-6 bg-green-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why verify your account?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Create and manage property listings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Accept bookings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Access financial reports and analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                  Build trust with potential guests
                </li>
              </ul>
            </div>
          )}

          {error && (
            <div className="mx-8 mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
            {/* Form Header */}
            {(isEditing || !verificationStatus?.data) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {verificationStatus?.status === 'pending' ? 'Update Verification Documents' : 'Submit Verification Documents'}
                </h2>
              </div>
            )}

            {/* Business Information Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Business Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business/Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                    }`}
                    placeholder=""
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporation">Corporation</option>
                    <option value="LLC">LLC</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Property Management">Property Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address <span className="text-red-500">*</span>
                </label>
                
                {formData.businessAddress && isEditing && (
                  <div className="mb-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Address selected</p>
                      <p className="text-xs text-green-700">{formData.businessAddress}</p>
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <div className="relative">
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                      <input
                        id="businessAddress"
                        type="text"
                        placeholder="Search for an address... (e.g., 123 Main St, New York)"
                        value={addressSearchQuery}
                        onChange={handleAddressSearch}
                        onFocus={() => addressSearchResults.length > 0 && setShowAddressDropdown(true)}
                        required={!formData.businessAddress}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                      {isSearchingAddress && (
                        <div className="absolute right-4 top-3">
                          <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Address Search Results Dropdown */}
                    {showAddressDropdown && addressSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                        {addressSearchResults.map((result, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectAddress(result)}
                            className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-green-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {result.display_name.split(',')[0]}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {result.display_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addressSearchQuery && !isSearchingAddress && addressSearchResults.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 px-4 py-3">
                        <p className="text-sm text-gray-600 text-center">No addresses found. Try a different search.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                    {formData.businessAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Identification Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Identification</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type
                  </label>
                  <select
                    id="idType"
                    name="idType"
                    value={formData.idType}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value !== 'Other') {
                        setCustomIdType('');
                      }
                    }}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="National ID">National ID</option>
                    <option value="State ID">State ID</option>
                    <option value="Other">Other (Please specify)</option>
                  </select>
                  
                  {/* Custom ID Type Input */}
                  {formData.idType === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter your ID type (e.g., Voter ID, Police ID, etc.)"
                      value={customIdType}
                      onChange={(e) => {
                        setCustomIdType(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          idType: e.target.value || 'Other'
                        }));
                      }}
                      disabled={!isEditing}
                      className={`w-full mt-3 px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                      }`}
                    />
                  )}
                </div>

                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                    }`}
                    placeholder=""
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tax ID / TIN <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="hasTax"
                          name="taxOption"
                          value="has"
                          checked={formData.taxId !== 'none' && formData.taxId !== ''}
                          onChange={() => setFormData(prev => ({ ...prev, taxId: '' }))}
                          disabled={!isEditing}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <label htmlFor="hasTax" className="text-sm font-medium text-gray-700 cursor-pointer">
                          I have a Tax ID / TIN
                        </label>
                      </div>

                      {formData.taxId !== 'none' && (
                        <input
                          id="taxId"
                          name="taxId"
                          type="text"
                          value={formData.taxId}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                            !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                          }`}
                          placeholder="Enter your Tax ID (e.g., 12-3456789)"
                        />
                      )}

                      <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                        <input
                          type="radio"
                          id="noTax"
                          name="taxOption"
                          value="none"
                          checked={formData.taxId === 'none'}
                          onChange={() => setFormData(prev => ({ ...prev, taxId: 'none' }))}
                          disabled={!isEditing}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <label htmlFor="noTax" className="text-sm font-medium text-gray-700 cursor-pointer">
                          I don't have a Tax ID / TIN
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                      {formData.taxId === 'none' ? (
                        <span className="text-sm italic">Not provided</span>
                      ) : (
                        formData.taxId
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* ID Photo Verification Section */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 p-2 rounded-lg mr-3">
                  <CameraIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">ID Photo Verification</h3>
                  <p className="text-sm text-gray-600">Verify identity documents and photo authenticity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-2">1</span>
                      ID Document Photo
                    </span>
                  </label>
                  <div className={`bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    !isEditing ? 'border-gray-300' : 'border-blue-300 hover:border-blue-400'
                  }`}>
                    <input
                      type="file"
                      name="idDocumentPhoto"
                      accept="image/*"
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="hidden"
                      id="idDocumentPhoto"
                    />
                    <label htmlFor="idDocumentPhoto" className={!isEditing ? 'cursor-default' : 'cursor-pointer'}>
                      {imagePreviews.idDocumentPhoto || (verificationStatus?.data?.files?.idDocumentPhoto && !isEditing) ? (
                        <div>
                          {imagePreviews.idDocumentPhoto ? (
                            <img 
                              src={imagePreviews.idDocumentPhoto} 
                              alt="ID Document Preview" 
                              className="w-32 h-32 object-cover mx-auto rounded-lg mb-3"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <p className="text-blue-600 font-medium text-lg">ID Document Photo</p>
                          {verificationStatus?.data?.files?.idDocumentPhoto && (
                            <>
                              <p className="text-green-600 text-sm mt-1">✓ {verificationStatus.data.files.idDocumentPhoto.originalName}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {(verificationStatus.data.files.idDocumentPhoto.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleViewFile(verificationStatus.data.files.idDocumentPhoto, 'ID Document Photo')}
                                  className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  View Image
                                </button>
                              )}
                            </>
                          )}
                          {isEditing && <p className="text-gray-500 text-xs mt-1">Click to change image</p>}
                        </div>
                      ) : (
                        <div>
                          <div className="text-blue-500 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-blue-600 font-medium text-lg">ID Document Photo</p>
                          <p className="text-gray-500 text-sm mt-1">Click to upload image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-2">2</span>
                      Owner Holding ID Photo
                    </span>
                  </label>
                  <div className={`bg-gray-50 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    !isEditing ? 'border-gray-300' : 'border-green-300 hover:border-green-400'
                  }`}>
                    <input
                      type="file"
                      name="ownerHoldingIdPhoto"
                      accept="image/*"
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="hidden"
                      id="ownerHoldingIdPhoto"
                    />
                    <label htmlFor="ownerHoldingIdPhoto" className={!isEditing ? 'cursor-default' : 'cursor-pointer'}>
                      {imagePreviews.ownerHoldingIdPhoto || (verificationStatus?.data?.files?.ownerHoldingIdPhoto && !isEditing) ? (
                        <div>
                          {imagePreviews.ownerHoldingIdPhoto ? (
                            <img 
                              src={imagePreviews.ownerHoldingIdPhoto} 
                              alt="Owner Holding ID Preview" 
                              className="w-32 h-32 object-cover mx-auto rounded-lg mb-3"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <UserIcon className="w-16 h-16 text-green-600" />
                            </div>
                          )}
                          <p className="text-green-600 font-medium text-lg">Owner Holding ID Photo</p>
                          {verificationStatus?.data?.files?.ownerHoldingIdPhoto && (
                            <>
                              <p className="text-green-600 text-sm mt-1">✓ {verificationStatus.data.files.ownerHoldingIdPhoto.originalName}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {(verificationStatus.data.files.ownerHoldingIdPhoto.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleViewFile(verificationStatus.data.files.ownerHoldingIdPhoto, 'Owner Holding ID Photo')}
                                  className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  View Image
                                </button>
                              )}
                            </>
                          )}
                          {isEditing && <p className="text-gray-500 text-xs mt-1">Click to change image</p>}
                        </div>
                      ) : (
                        <div>
                          <div className="text-green-500 mb-3">
                            <UserIcon className="w-16 h-16 mx-auto" />
                          </div>
                          <p className="text-green-600 font-medium text-lg">Owner Holding ID Photo</p>
                          <p className="text-gray-500 text-sm mt-1">Click to upload image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Property Documents Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Property Documents</h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="proofOfOwnership" className="block text-sm font-medium text-gray-700 mb-2">
                    Proof of Ownership (URL or Document) <span className="text-red-500">*</span>
                  </label>
                  <div className={`border border-gray-300 rounded-lg p-4 ${!isEditing ? 'bg-gray-50' : ''}`}>
                    <input
                      type="file"
                      name="proofOfOwnership"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="hidden"
                      id="proofOfOwnership"
                    />
                    <label htmlFor="proofOfOwnership" className={`block ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}>
                      {formData.proofOfOwnership || (verificationStatus?.data?.files?.proofOfOwnership && !isEditing) ? (
                        <div className="text-center py-4">
                          {imagePreviews.proofOfOwnership && typeof imagePreviews.proofOfOwnership === 'string' && imagePreviews.proofOfOwnership.startsWith('data:image') ? (
                            <img 
                              src={imagePreviews.proofOfOwnership} 
                              alt="Proof of Ownership Preview" 
                              className="w-32 h-32 object-cover mx-auto rounded-lg mb-3"
                            />
                          ) : (
                            <div className="text-blue-500 mb-2">
                              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          {verificationStatus?.data?.files?.proofOfOwnership ? (
                            <>
                              <p className="text-green-600 font-medium">✓ File uploaded: {verificationStatus.data.files.proofOfOwnership.originalName}</p>
                              <p className="text-gray-500 text-sm mt-1">
                                {(verificationStatus.data.files.proofOfOwnership.size / 1024 / 1024).toFixed(2)} MB • {verificationStatus.data.files.proofOfOwnership.mimetype}
                              </p>
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleViewFile(verificationStatus.data.files.proofOfOwnership, 'Proof of Ownership')}
                                  className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  {verificationStatus.data.files.proofOfOwnership.mimetype?.startsWith('image/') ? 'View Image' : 'View Document'}
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-green-600 font-medium">File uploaded: {formData.proofOfOwnership.name}</p>
                          )}
                          {isEditing && <p className="text-gray-500 text-sm mt-1">Click to change document</p>}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-600">Property deed, bill, or lease agreement</p>
                          <p className="text-sm text-gray-500 mt-1">Click to upload document</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="additionalDocuments" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Documents (Optional)
                  </label>
                  <div className={`border border-gray-300 rounded-lg p-4 ${!isEditing ? 'bg-gray-50' : ''}`}>
                    <input
                      type="file"
                      name="additionalDocuments"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="hidden"
                      id="additionalDocuments"
                    />
                    <label htmlFor="additionalDocuments" className={`block ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}>
                      {formData.additionalDocuments || (verificationStatus?.data?.files?.additionalDocuments && !isEditing) ? (
                        <div className="text-center py-4">
                          {imagePreviews.additionalDocuments && typeof imagePreviews.additionalDocuments === 'string' && imagePreviews.additionalDocuments.startsWith('data:image') ? (
                            <img 
                              src={imagePreviews.additionalDocuments} 
                              alt="Additional Documents Preview" 
                              className="w-32 h-32 object-cover mx-auto rounded-lg mb-3"
                            />
                          ) : (
                            <div className="text-blue-500 mb-2">
                              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          {verificationStatus?.data?.files?.additionalDocuments ? (
                            <>
                              <p className="text-green-600 font-medium">✓ File uploaded: {verificationStatus.data.files.additionalDocuments.originalName}</p>
                              <p className="text-gray-500 text-sm mt-1">
                                {(verificationStatus.data.files.additionalDocuments.size / 1024 / 1024).toFixed(2)} MB • {verificationStatus.data.files.additionalDocuments.mimetype}
                              </p>
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleViewFile(verificationStatus.data.files.additionalDocuments, 'Additional Documents')}
                                  className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  {verificationStatus.data.files.additionalDocuments.mimetype?.startsWith('image/') ? 'View Image' : 'View Document'}
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-green-600 font-medium">File uploaded: {formData.additionalDocuments.name}</p>
                          )}
                          {isEditing && <p className="text-gray-500 text-sm mt-1">Click to change document</p>}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-600">Business permits, insurance, etc.</p>
                          <p className="text-sm text-gray-500 mt-1">Click to upload additional documents</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 space-y-4">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {verificationStatus?.status === 'pending' ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      verificationStatus?.status === 'pending' ? 'Update Verification' : 'Submit For Verification'
                    )}
                  </button>
                  
                  {verificationStatus?.status !== 'pending' && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={loading}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                    >
                      Skip for now - I'll verify later
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    Your verification documents are currently under review. You can edit your submission if needed.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/host/dashboard')}
                    className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
              
              {verificationStatus?.status !== 'pending' && (
                <p className="text-center text-sm text-gray-600 mt-4">
                  You can complete verification anytime from your dashboard settings. Some features may be limited until verification is complete.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <ImageModal />
      <DocumentModal />
    </div>
  );
};

export default HostVerificationForm;