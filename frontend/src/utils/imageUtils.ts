import { config } from '../config/environment'

// Utility function to get the correct base URL for images
export const getImageBaseUrl = () => {
  return config.getImageBaseUrl()
}

// Utility function to get the correct image URL
export const getImageUrl = (url: string) => {
  if (!url) return '/placeholder-property.svg'
  if (url.includes('example.com/mock-upload')) return '/placeholder-property.svg'
  
  // If it's already a full URL (S3 URL or external URL), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If it's a local upload path, construct the full URL
  if (url.startsWith('/uploads/')) {
    const baseUrl = getImageBaseUrl()
    const fullUrl = `${baseUrl}${url}`
    return encodeURI(fullUrl)
  }
  
  return url
}

// Utility function to get the correct file URL for downloads
export const getFileUrl = (filePath: string) => {
  if (!filePath) return ''
  
  // If it's already a full URL (S3 URL or external URL), return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  // If it's a local upload path, construct the full URL
  if (filePath.startsWith('/uploads/')) {
    const baseUrl = getImageBaseUrl()
    return `${baseUrl}${filePath}`
  }
  
  return filePath
}
