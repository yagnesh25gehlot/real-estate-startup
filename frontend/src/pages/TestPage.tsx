import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  User, 
  CreditCard, 
  CheckCircle, 
  X,
  Image as ImageIcon
} from 'lucide-react'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

const TestPage = () => {
  const navigate = useNavigate()
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [uploadingAadhaarImage, setUploadingAadhaarImage] = useState(false)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const [aadhaarImagePreview, setAadhaarImagePreview] = useState<string | null>(null)

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setProfilePicPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingProfilePic(true)
    
    try {
      console.log('Uploading profile picture:', file.name)
      const formData = new FormData()
      formData.append('profilePic', file)
      
      const response = await authApi.uploadProfilePic(formData)
      console.log('Profile picture upload response:', response.data)
      toast.success('Profile picture uploaded successfully!')
    } catch (error: any) {
      console.error('Profile pic upload error:', error)
      toast.error(error.response?.data?.error || 'Failed to upload profile picture')
    } finally {
      setUploadingProfilePic(false)
    }
  }

  const handleAadhaarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAadhaarImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingAadhaarImage(true)
    
    try {
      console.log('Uploading aadhaar image:', file.name)
      const formData = new FormData()
      formData.append('aadhaarImage', file)
      
      const response = await authApi.uploadAadhaarImage(formData)
      console.log('Aadhaar image upload response:', response.data)
      toast.success('Aadhaar image uploaded successfully!')
    } catch (error: any) {
      console.error('Aadhaar image upload error:', error)
      toast.error(error.response?.data?.error || 'Failed to upload aadhaar image')
    } finally {
      setUploadingAadhaarImage(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Image Upload Test - RealtyTopper</title>
      </Helmet>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Image Upload Test</h1>
          <p className="text-gray-600 mt-2">
            Test the image upload functionality for profile pictures and Aadhaar images
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Picture Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Picture Upload</h2>
            </div>
            
            <div className="space-y-4">
              {/* Current Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profilePicPreview ? (
                      <img 
                        src={profilePicPreview} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                      disabled={uploadingProfilePic}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Picture</p>
                  <p className="text-xs text-gray-500">
                    {uploadingProfilePic ? 'Uploading...' : 'Click camera icon to upload'}
                  </p>
                </div>
              </div>

              {/* Upload Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Upload Instructions</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Supported formats: JPG, PNG, GIF, SVG</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Image will be automatically resized</li>
                  <li>• Click the camera icon to select a file</li>
                </ul>
              </div>

              {/* Upload Status */}
              {uploadingProfilePic && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Uploading profile picture...</span>
                </div>
              )}
            </div>
          </div>

          {/* Aadhaar Image Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Aadhaar Image Upload</h2>
            </div>
            
            <div className="space-y-4">
              {/* Current Aadhaar Image */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {aadhaarImagePreview ? (
                      <img 
                        src={aadhaarImagePreview} 
                        alt="Aadhaar Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 cursor-pointer transition-colors rounded">
                    <Upload className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAadhaarImageUpload}
                      className="hidden"
                      disabled={uploadingAadhaarImage}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aadhaar Card Image</p>
                  <p className="text-xs text-gray-500">
                    {uploadingAadhaarImage ? 'Uploading...' : 'Click to upload Aadhaar image'}
                  </p>
                </div>
              </div>

              {/* Upload Instructions */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">Upload Instructions</h3>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Supported formats: JPG, PNG, GIF, SVG</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Upload a clear image of your Aadhaar card</li>
                  <li>• Ensure all details are clearly visible</li>
                </ul>
              </div>

              {/* Upload Status */}
              {uploadingAadhaarImage && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-sm">Uploading Aadhaar image...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
              {profilePicPreview ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Successfully uploaded</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <X className="h-5 w-5" />
                  <span>No image uploaded</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aadhaar Image</h3>
              {aadhaarImagePreview ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Successfully uploaded</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <X className="h-5 w-5" />
                  <span>No image uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => navigate('/profile')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Profile Page
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Admin Users
          </button>
        </div>
      </div>
    </>
  )
}

export default TestPage 