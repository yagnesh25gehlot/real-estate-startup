import React, { useState, useEffect } from 'react'
import { X, Save, Building2, MapPin, DollarSign, FileText, Upload, Trash2, Image, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { propertiesApi } from '../services/api'

interface PropertyEditModalProps {
  property: any
  onClose: () => void
  onSave: (updatedProperty: any) => void
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({ property, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: property.title || '',
    description: property.description || '',
    type: property.type || '',
    location: property.location || '',
    address: property.address || '',
    price: property.price || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Image management state
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [removingImages, setRemovingImages] = useState<string[]>([])

  // Parse mediaUrls on component mount
  useEffect(() => {
    if (property.mediaUrls) {
      const mediaUrlsArray = typeof property.mediaUrls === 'string' 
        ? JSON.parse(property.mediaUrls) 
        : property.mediaUrls
      setCurrentImages(mediaUrlsArray || [])
    }
  }, [property.mediaUrls])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      const invalidFiles = files.filter(file => !validTypes.includes(file.type))
      
      if (invalidFiles.length > 0) {
        toast.error('Please select only image files (JPEG, PNG, WebP)')
        return
      }
      
      // Validate file sizes (max 5MB each)
      const maxSize = 5 * 1024 * 1024 // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSize)
      
      if (oversizedFiles.length > 0) {
        toast.error('Image files must be smaller than 5MB each')
        return
      }
      
      setNewImages(prev => [...prev, ...files])
      toast.success(`${files.length} image(s) selected`)
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeCurrentImage = (imageUrl: string) => {
    setRemovingImages(prev => [...prev, imageUrl])
    setCurrentImages(prev => prev.filter(img => img !== imageUrl))
  }

  const undoRemoveImage = (imageUrl: string) => {
    setRemovingImages(prev => prev.filter(img => img !== imageUrl))
    setCurrentImages(prev => [...prev, imageUrl])
  }

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return []
    
    const uploadedUrls: string[] = []
    
    for (const file of newImages) {
      try {
        const formData = new FormData()
        formData.append('image', file)
        
        // Upload to backend
        const response = await propertiesApi.uploadImage(formData)
        if (response.data?.data?.url) {
          uploadedUrls.push(response.data.data.url)
        } else if (response.data?.url) {
          uploadedUrls.push(response.data.url)
        }
      } catch (error) {
        console.error('Failed to upload image:', error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
    setUploadingImages(true)
    
    try {
      // Upload new images first
      const newImageUrls = await uploadNewImages()
      
      // Combine current images (excluding removed ones) with new images
      const finalImageUrls = [
        ...currentImages.filter(img => !removingImages.includes(img)),
        ...newImageUrls
      ]
      

      
      const updatedProperty = {
        ...property,
        ...formData,
        price: parseFloat(formData.price),
        mediaUrls: JSON.stringify(finalImageUrls)
      }
      
      await onSave(updatedProperty)
      
      // Clear state
      setNewImages([])
      setRemovingImages([])
      
    } catch (error) {
      console.error('Error updating property:', error)
      toast.error('Failed to update property')
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
    }
  }

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder-property.svg'
    if (url.startsWith('/uploads/')) {
      return `http://localhost:3001${url}`
    }
    return url
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Edit Property
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Management Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Image className="h-5 w-5 mr-2" />
              Image Management
            </h3>
            
            {/* Current Images */}
            {currentImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images ({currentImages.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageUrl(imageUrl)}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-property.svg'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCurrentImage(imageUrl)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Removed Images (can be restored) */}
            {removingImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Removed Images (click to restore)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {removingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageUrl(imageUrl)}
                        alt={`Removed image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 opacity-50 cursor-pointer"
                        onClick={() => undoRemoveImage(imageUrl)}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-property.svg'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">New Images to Upload ({newImages.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload New Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Click to upload images
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, WebP up to 5MB each
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Beautiful 3-bedroom house"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="PLOT">Plot</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5000000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your property in detail..."
              />
            </div>

            <div className="mt-4">
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
            </div>
          </div>

          {/* Current Property Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Property Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  property.status === 'FREE' ? 'bg-green-100 text-green-800' :
                  property.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {property.status}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Images:</span>
                <span className="ml-2">{currentImages.length + newImages.length - removingImages.length}</span>
              </div>
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2 font-mono text-xs">{property.id}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting || uploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploadingImages ? 'Uploading Images...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PropertyEditModal

