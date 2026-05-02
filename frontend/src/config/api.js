// Centralized API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_ROOT = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000';

export const getApiUrl = (path = '') => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path already includes /api, use root
  if (cleanPath.startsWith('api/')) {
    return `${API_ROOT}/${cleanPath}`;
  }
  
  // Otherwise use API_BASE_URL
  return cleanPath ? `${API_BASE_URL}/${cleanPath}` : API_BASE_URL;
};

export const getFileUrl = (fileId) => {
  return `${API_ROOT}/api/files/${fileId}`;
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ROOT: API_ROOT,
  WS_URL: API_ROOT.replace(/^http/, 'ws'),
};

export default API_CONFIG;
