// Environment configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Environment detection
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  
  // Image and file URLs
  getImageBaseUrl: () => {
    if (import.meta.env.PROD) {
      return window.location.origin
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3001'
  },
  
  // App configuration
  appName: 'RealtyTopper',
  appVersion: '1.0.0'
}
