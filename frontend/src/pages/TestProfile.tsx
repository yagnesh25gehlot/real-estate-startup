import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

const TestProfile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    aadhaar: '',
  })

  useEffect(() => {
    if (user) {
      console.log('Setting form data with user:', user)
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        aadhaar: user.aadhaar || '',
      })
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Updating profile with data:', formData)
      const response = await authApi.updateProfile(formData)
      console.log('Profile update response:', response.data)
      updateUser(response.data.data.user)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.response?.data?.error || 'Failed to update profile')
    }
  }

  if (!user) {
    return <div className="p-6">Please login first</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <button
            onClick={() => {
              console.log('Edit button clicked')
              setIsEditing(!isEditing)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{user.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="font-medium">{user.mobile || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aadhaar</p>
              <p className="font-medium">{user.aadhaar || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  console.log('Name changed:', e.target.value)
                  setFormData({ ...formData, name: e.target.value })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => {
                  console.log('Mobile changed:', e.target.value)
                  setFormData({ ...formData, mobile: e.target.value })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhaar Number
              </label>
              <input
                type="text"
                value={formData.aadhaar}
                onChange={(e) => {
                  console.log('Aadhaar changed:', e.target.value)
                  setFormData({ ...formData, aadhaar: e.target.value })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Aadhaar number"
                maxLength={12}
              />
            </div>

            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Name: "{formData.name}"</p>
              <p>Mobile: "{formData.mobile}"</p>
              <p>Aadhaar: "{formData.aadhaar}"</p>
              <p>Is Editing: {isEditing ? 'Yes' : 'No'}</p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default TestProfile
