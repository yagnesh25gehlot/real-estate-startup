import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  dealerSignup: (data: any) => api.post('/auth/dealer-signup', data),
  applyForDealer: (data: any) => api.post('/auth/apply-dealer', data),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  uploadProfilePic: (data: any) => api.post('/auth/profile-picture', data),
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