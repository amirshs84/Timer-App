const getBaseURL = () => {
  console.log('Current VITE_API_URL:', import.meta.env.VITE_API_URL); // Debug log
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback for development
  return 'http://localhost:8000/api/';
};

export const API_BASE_URL = getBaseURL();
console.log('Final API_BASE_URL:', API_BASE_URL); // Debug log
