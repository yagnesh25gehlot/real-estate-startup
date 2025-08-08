import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  MapPin, 
  Upload, 
  X, 
  Camera, 
  Map,
  Navigation,
  Building2,
  DollarSign,
  FileText,
  Home
} from 'lucide-react'
import { propertiesApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
}

const SellProperty = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [showMap, setShowMap] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    price: ''
  })

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // Get current location
  const getCurrentLocation = useCallback(() => {
    console.log('🔍 Getting current location...')
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setIsGettingLocation(true)
    // Show loading state
    toast.loading('Getting your location...', { id: 'location' })

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('📍 Location obtained:', position.coords)
        const { latitude, longitude } = position.coords
        
        try {
          // Reverse geocoding to get address
          console.log('🌍 Getting address from coordinates...')
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          )
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('📍 Address data:', data)
          
          const address = data.display_name || ''
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || ''
          
          setCurrentLocation({ latitude, longitude, address, city })
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            address: address,
            location: city || prev.location // Keep existing location if no city found
          }))
          
          toast.success('Location detected successfully!', { id: 'location' })
          console.log('✅ Location set successfully')
        } catch (error) {
          console.error('❌ Error getting address:', error)
          toast.error('Could not get address details, but coordinates are saved', { id: 'location' })
          
          // Still save the coordinates even if address lookup fails
          setCurrentLocation({ latitude, longitude, address: '', city: '' })
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString()
          }))
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error)
        let errorMessage = 'Could not get your current location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'An unknown error occurred while getting location.'
        }
        
        toast.error(errorMessage, { id: 'location' })
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [])

  // Handle file uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = uploadedFiles.length + acceptedFiles.length
    if (totalFiles > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      return true
    })

    setUploadedFiles(prev => [...prev, ...validFiles])
  }, [uploadedFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to list a property')
      return
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Property title is required')
      return
    }
    if (!formData.type) {
      toast.error('Property type is required')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required')
      return
    }
    if (!formData.location.trim()) {
      toast.error('City/Location is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Property description is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      formDataToSend.append('type', formData.type)
      formDataToSend.append('location', formData.location.trim())
      formDataToSend.append('address', formData.address.trim() || '')
      formDataToSend.append('latitude', formData.latitude || '')
      formDataToSend.append('longitude', formData.longitude || '')
      formDataToSend.append('price', formData.price)

      // Append files (optional)
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append('mediaFiles', file)
      })

      await propertiesApi.create(formDataToSend)
      
      toast.success('Property listed successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error creating property:', error)
      toast.error(error.response?.data?.error || 'Failed to list property')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Helmet>
        <title>List Your Property - Property Platform</title>
      </Helmet>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List Your Property</h1>
          <p className="text-gray-600 mt-2">
            Reach thousands of potential buyers and renters
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Beautiful 3-bedroom house in downtown"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a descriptive title for your property</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="PLOT">Plot</option>
                  <option value="VILLA">Villa</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose the type that best describes your property</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the price in Indian Rupees (₹)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the city or general location of your property</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your property in detail..."
              />
              <p className="text-xs text-gray-500 mt-1">Provide a detailed description of your property features and amenities</p>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Details <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Optional:</strong> Provide detailed location information to help buyers find your property. You can use "Get Current Location" to auto-fill these details.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Current Location
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Map className="h-4 w-4 mr-2" />
                  {showMap ? 'Hide Map' : 'Show Map'}
                </button>
              </div>

              {currentLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="font-medium">Location Detected</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">{currentLocation.address}</p>
                </div>
              )}

              {showMap && currentLocation && (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.longitude-0.01},${currentLocation.latitude-0.01},${currentLocation.longitude+0.01},${currentLocation.latitude+0.01}&layer=mapnik&marker=${currentLocation.latitude},${currentLocation.longitude}`}
                    width="100%"
                    height="300"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    title="Property Location"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Address <span className="text-gray-500 text-sm">(Optional)</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed address including street, area, landmarks..."
                />
                <p className="text-xs text-gray-500 mt-1">Provide detailed address for better property visibility</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-gray-500 text-sm">(Auto-filled)</span>
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Latitude (auto-filled)"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically filled when you use "Get Current Location"</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-gray-500 text-sm">(Auto-filled)</span>
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Longitude (auto-filled)"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically filled when you use "Get Current Location"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Property Images <span className="text-sm font-normal text-gray-500 ml-2">(Optional but Recommended)</span>
            </h2>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> The first image you upload will be used as the profile picture in property listings. Upload high-quality images to attract more buyers.
              </p>
            </div>

            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the images here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop images here, or click to select files
                    </p>
                    <p className="text-sm text-gray-500">
                      Maximum 5 images, 10MB each. First image will be the profile picture. Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Images ({uploadedFiles.length}/5)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Listing Property...
                </>
              ) : (
                <>
                  <Home className="h-4 w-4 mr-2" />
                  List Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default SellProperty 