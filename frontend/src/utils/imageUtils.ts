import { config } from '../config/environment'

// Utility function to get the correct base URL for images
export const getImageBaseUrl = () => {
  return config.getImageBaseUrl()
}

// Utility function to get the correct image URL
export const getImageUrl = (url: string) => {
  if (!url) return '/placeholder-property.svg'
  if (url.includes('example.com/mock-upload')) return '/placeholder-property.svg'
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
  if (filePath.startsWith('/uploads/')) {
    const baseUrl = getImageBaseUrl()
    return `${baseUrl}${filePath}`
  }
  return filePath
}
