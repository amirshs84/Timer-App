import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh (optional/basic for now)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
       // For now, just logout if token expires (simple implementation)
       // Can be enhanced with refresh token logic later
       localStorage.removeItem('accessToken');
       localStorage.removeItem('refreshToken');
       localStorage.removeItem('isLoggedIn');
       window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  requestOtp: (phoneNumber) => api.post('auth/request-otp/', { phone_number: phoneNumber }),
  login: (phoneNumber, otp) => api.post('auth/login/', { phone_number: phoneNumber, otp }),
  getProfile: () => api.get('profile/'),
  updateProfile: (data) => api.put('profile/', data),
};

export const dataAPI = {
  getSubjects: () => api.get('subjects/'),
  createSubject: (data) => api.post('subjects/', data),
  getSessions: () => api.get('sessions/'), // This endpoint lists recent sessions
  createSession: (data) => api.post('sessions/', data),
  getDashboardStats: () => api.get('dashboard/stats/'),
};

// Manager Panel API
export const managerAPI = {
  getDashboardKPI: () => api.get('manager/dashboard/'),
  getStudentList: (params) => api.get('manager/students/', { params }),
  getStudentProfile: (userId) => api.get(`manager/students/${userId}/profile/`),
  exportExcel: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return `${api.defaults.baseURL}manager/export/excel/?${params.toString()}`;
  },
};

// SuperAdmin Panel API
export const superadminAPI = {
  getSchools: () => api.get('superadmin/schools/'),
  createSchool: (data) => api.post('superadmin/schools/', data),
  updateSchool: (id, data) => api.put(`superadmin/schools/${id}/`, data),
  deleteSchool: (id) => api.delete(`superadmin/schools/${id}/`),
  assignManager: (schoolId, data) => api.post(`superadmin/schools/${schoolId}/assign-manager/`, data),
  getSchoolMembers: (schoolId) => api.get(`superadmin/schools/${schoolId}/members/`),
};

export default api;

