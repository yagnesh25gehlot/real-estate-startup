import axios from 'axios'

// Environment detection
const isProduction = import.meta.env.PROD
const isLocal = import.meta.env.DEV

// API Base URL configuration with fallbacks
const getApiBaseUrl = (): string => {
  // Production environment
  if (isProduction) {
    return 'https://real-estate-startup-production.up.railway.app'
  }
  
  // Local development
  if (isLocal) {
    // Check if VITE_API_URL is set (for custom local backend)
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL
    }
    // Default local backend
    return 'http://localhost:3001'
  }
  
  // Fallback for other environments
  return import.meta.env.VITE_API_URL || 'https://real-estate-startup-production.up.railway.app'
}

const API_BASE_URL = getApiBaseUrl()

console.log('🔧 Frontend API Configuration:', {
  PROD: isProduction,
  DEV: isLocal,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL
})

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Mobile-specific timeout settings
  timeout: isMobile ? 30000 : 10000, // 30 seconds for mobile, 10 for desktop
})

// Request interceptor to add user email header for MVP mode
api.interceptors.request.use(
  (config) => {
    // Mobile detection for logging only (not sent as header to avoid CORS issues)
    const deviceType = isMobile ? 'mobile' : 'desktop'
    
    // Add user email to headers for MVP mode authentication
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        config.headers['X-User-Email'] = user.email
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    console.log('🔍 API Request:', {
      url: config.url,
      method: config.method,
      device: deviceType,
      hasUserEmail: !!config.headers['X-User-Email']
    })
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      device: isMobile ? 'mobile' : 'desktop'
    })
    return response
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      device: isMobile ? 'mobile' : 'desktop',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      }
    })

    if (error.response?.status === 401) {
      // Unauthorized - clear user data and redirect to login
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Enhanced error handling for mobile
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      error.message = 'Network error. Please check your internet connection and try again.'
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.message = 'Request timed out. Please check your connection and try again.'
    } else if (error.response?.status === 0) {
      error.message = 'Unable to connect to server. Please check your connection and try again.'
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again in a few moments.'
    } else if (error.response?.status === 404) {
      error.message = 'Service not found. Please try again later.'
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const propertiesApi = {
  getAll: (params?: any) => api.get('/properties', { params }),
  getAllForAdmin: (params?: any) => api.get('/properties/admin/all', { params }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: FormData) => api.post('/properties', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/properties/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getTypes: () => api.get('/properties/types/list'),
  getLocations: () => api.get('/properties/locations/list'),
  uploadImage: (data: FormData) => api.post('/properties/upload-image', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const bookingsApi = {
  // For manual UPI booking: send multipart form with paymentProof
  createBooking: (data: { propertyId: string, dealerCode?: string, paymentRef: string, paymentProof?: File }) => {
    const form = new FormData()
    form.append('propertyId', data.propertyId)
    if (data.dealerCode) form.append('dealerCode', data.dealerCode)
    form.append('paymentRef', data.paymentRef)
    if (data.paymentProof) form.append('paymentProof', data.paymentProof)
    return api.post('/bookings/create', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  confirmBooking: (data: any) => api.post('/bookings/confirm', data),
  getMyBookings: (params?: any) => api.get('/bookings/my-bookings', { params }),
  getAllBookings: (params?: any) => api.get('/bookings', { params }), // Admin endpoint
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.delete(`/bookings/${id}`),
  getStats: () => api.get('/bookings/stats'),
  updateExpired: () => api.post('/bookings/update-expired'),
  approve: (id: string) => api.put(`/bookings/${id}/approve`),
  reject: (id: string) => api.put(`/bookings/${id}/reject`),
  unbook: (id: string) => api.put(`/bookings/${id}/unbook`),
}

export const authApi = {
  googleLogin: (data: any) => api.post('/auth/google', data),
  signup: (data: any) => {
    // If data is FormData (contains file), send as multipart
    if (data instanceof FormData) {
      return api.post('/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Otherwise send as JSON
    return api.post('/auth/signup', data);
  },
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  dealerSignup: (data: any) => {
    // If data is FormData (contains file), send as multipart
    if (data instanceof FormData) {
      return api.post('/auth/dealer-signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    // Otherwise send as JSON
    return api.post('/auth/dealer-signup', data);
  },
  applyForDealer: (data: any) => api.post('/auth/apply-dealer', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  uploadProfilePic: (data: any) => api.post('/auth/profile-picture', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadAadhaarImage: (data: any) => api.post('/auth/aadhaar-image', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data: any) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout'),
}

export const dealersApi = {
  getCommissions: () => api.get('/dealers/my-commissions'),
  getHierarchy: (dealerId: string) => api.get(`/dealers/hierarchy/${dealerId}`),
  getStats: (dealerId: string) => api.get(`/dealers/stats/${dealerId}`),
  getByReferralCode: (referralCode: string) => api.get(`/dealers/referral/${referralCode}`),
  getTree: (dealerId: string, maxDepth?: number) => 
    api.get(`/dealers/tree/${dealerId}`, { params: { maxDepth } }),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPropertyAnalytics: () => api.get('/admin/analytics/properties'),
  getBookingAnalytics: () => api.get('/admin/analytics/bookings'),
  getDealerAnalytics: () => api.get('/admin/analytics/dealers'),
  getRecentActivity: () => api.get('/admin/recent-activity'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
  getDealerRequests: () => api.get('/admin/dealer-requests'),
  approveDealer: (dealerId: string) => api.put(`/admin/dealer-requests/${dealerId}/approve`),
  rejectDealer: (dealerId: string) => api.put(`/admin/dealer-requests/${dealerId}/reject`),
  getDealerTree: () => api.get('/admin/dealer-tree'),
  blockUser: (userId: string) => api.put(`/admin/users/${userId}/block`),
  unblockUser: (userId: string) => api.put(`/admin/users/${userId}/unblock`),
  
  // User management endpoints
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (userId: string) => api.get(`/admin/users/${userId}`),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (userId: string, data: any) => api.put(`/admin/users/${userId}`, data),
  updateUserPassword: (userId: string, password: string) => api.put(`/admin/users/${userId}/password`, { password }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  uploadUserProfilePic: (userId: string, data: FormData) => api.post(`/admin/users/${userId}/profile-picture`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadUserAadhaarImage: (userId: string, data: FormData) => api.post(`/admin/users/${userId}/aadhaar-image`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const commissionApi = {
  getConfig: () => api.get('/commission/config'),
  updateConfig: (data: any) => api.put('/commission/config', data),
  getPendingDealers: () => api.get('/commission/pending-dealers'),
  approveDealer: (dealerId: string) => api.put(`/commission/approve-dealer/${dealerId}`),
  calculateCommissions: (propertyId: string, saleAmount: number) => 
    api.post(`/commission/calculate/${propertyId}`, { saleAmount }),
}

export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  cleanup: () => api.delete('/notifications/cleanup'),
} 