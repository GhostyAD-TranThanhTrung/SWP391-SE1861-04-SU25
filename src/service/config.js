/**
 * API Configuration using Environment Variables
 * This file centralizes all API endpoints and configurations
 */

// Base URLs from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const CONTENT_BASE_URL = import.meta.env.VITE_CONTENT_BASE_URL || 'http://localhost:3000/content';
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3000/uploads';

// Content URLs
export const CONTENT_URLS = {
  // Image paths using the new API endpoint
  IMAGE: (imagePath) => `${API_URL}/images/${imagePath}`,
  
  // Convert relative markdown image paths to absolute URLs using API endpoint
  CONVERT_IMAGE_PATH: (imagePath) => {
    // If it's already an absolute URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Convert relative paths to use the new API endpoint
    if (imagePath.startsWith('../image/')) {
      return `${API_URL}/images/${imagePath.replace('../image/', '')}`;
    } else if (imagePath.startsWith('./image/')) {
      return `${API_URL}/images/${imagePath.replace('./image/', '')}`;
    } else if (imagePath.startsWith('image/')) {
      return `${API_URL}/images/${imagePath.replace('image/', '')}`;
    }
    
    // If it doesn't match expected patterns, assume it's relative to content root
    return `${API_URL}/images/${imagePath}`;
  }
};

// Upload URLs
export const UPLOAD_URLS = {
  BLOG_IMAGES: (filename) => `${UPLOADS_BASE_URL}/blog-images/${filename}`,
  PROFILE_PICTURES: (filename) => `${UPLOADS_BASE_URL}/profile-pictures/${filename}`,
  PROGRAM_IMAGES: (filename) => `${UPLOADS_BASE_URL}/program-images/${filename}`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function for Swagger bypass (development only)
export const getSwaggerBypassHeaders = () => {
  const isDevelopment = import.meta.env.NODE_ENV === 'development';
  return isDevelopment ? { 'x-swagger-bypass': 'true' } : {};
};

// Export default configuration object
export default {
  API_BASE_URL,
  API_URL,
  CONTENT_BASE_URL,
  UPLOADS_BASE_URL,
  CONTENT_URLS,
  UPLOAD_URLS,
  getAuthHeaders,
  getSwaggerBypassHeaders
}; 