/**
 * File Upload Utility
 * Handles image uploads via backend API (which uploads to Cloudinary)
 */
import API_CONFIG from '../config/api';

const apiBaseUrl = API_CONFIG.BASE_URL;

export const handleImageFileSelect = (e, callback) => {
  const file = e.target.files?.[0];
  
  if (!file) return false;

  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
    return false;
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('File size must be less than 5MB');
    return false;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (event) => {
    callback({
      file,
      preview: event.target.result,
      fileName: file.name,
      fileSize: file.size
    });
  };
  reader.onerror = () => {
    alert('Error reading file');
  };
  reader.readAsDataURL(file);

  return true;
};

export const uploadImageToCloudinary = async (file) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading image to backend:', {
      fileName: file.name,
      fileSize: file.size
    });

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(`${apiBaseUrl}/properties/upload`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Upload error response:', errorData);
      throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload successful:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};
