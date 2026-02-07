const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback for development
  return 'http://localhost:8000/api/';
};

export const API_BASE_URL = getBaseURL();
