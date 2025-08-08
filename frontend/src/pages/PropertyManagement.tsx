import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Building2, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Plus,
  Calendar,
  IndianRupee,
  MapPin,
  User
} from 'lucide-react'
import { propertiesApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import PropertyEditModal from '../components/PropertyEditModal'
import toast from 'react-hot-toast'

const PropertyManagement = () => {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('PropertyManagement component mounted')
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('Fetching properties for admin...')
      setLoading(true)
      setError(null)
      
      const response = await propertiesApi.getAllForAdmin({ limit: 100 })
      console.log('Admin properties response:', response)
      console.log('Response data structure:', response.data)
      console.log('Properties array:', response.data?.data?.properties)
      console.log('Properties count:', response.data?.data?.properties?.length)
      
      if (response.data && response.data.data) {
        const propertiesArray = response.data.data.properties || []
        console.log('Setting properties:', propertiesArray.length, 'properties')
        setProperties(propertiesArray)
      } else {
        console.log('No properties data found, setting empty array')
        setProperties([])
      }
      
    } catch (error: any) {
      console.error('Failed to fetch properties:', error)
      console.error('Error response:', error.response?.data)
      setError(error.response?.data?.error || 'Failed to load properties')
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (propertyId: string, newStatus: string) => {
    try {
      setUpdatingStatus(propertyId)
      console.log('Updating property status:', propertyId, newStatus)
      
      await propertiesApi.update(propertyId, { status: newStatus } as any)
      toast.success(`Property status updated to ${newStatus}`)
      
      // Update local state
      setProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, status: newStatus } : p
      ))
      
    } catch (error: any) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update property status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }
    
    try {
      setDeletingProperty(propertyId)
      await propertiesApi.delete(propertyId)
      toast.success('Property deleted successfully')
      
      // Remove from local state
      setProperties(prev => prev.filter(p => p.id !== propertyId))
      
    } catch (error: any) {
      console.error('Failed to delete property:', error)
      toast.error('Failed to delete property')
    } finally {
      setDeletingProperty(null)
    }
  }

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property)
    setShowPropertyModal(true)
  }

  const handleViewProperty = (property: any) => {
    navigate(`/property/${property.id}`)
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || property.status === statusFilter
    const matchesType = typeFilter === 'ALL' || property.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE': return 'bg-green-100 text-green-800'
      case 'SOLD': return 'bg-red-100 text-red-800'
      case 'BOOKED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'APARTMENT': return 'bg-blue-100 text-blue-800'
      case 'VILLA': return 'bg-purple-100 text-purple-800'
      case 'COMMERCIAL': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Property Management - Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600 mt-2">
            Manage properties across the platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'FREE').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'SOLD').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter(p => p.status === 'BOOKED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search properties by title, location, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="FREE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="BOOKED">Booked</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Properties ({filteredProperties.length})
              </h2>
              <div className="text-sm text-gray-500">
                Showing {filteredProperties.length} of {properties.length} properties
              </div>
            </div>
            
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600">No properties match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{property.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {property.location}
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {property.owner?.name || 'Unknown Owner'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                                {property.status}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(property.type)}`}>
                                {property.type}
                              </span>
                            </div>
                            <div className="flex items-center text-green-600 font-semibold">
                              <IndianRupee className="h-4 w-4 mr-1" />
                              ₹{property.price?.toLocaleString() || '0'}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {property.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Created: {new Date(property.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col space-y-2">
                        {/* Status Update */}
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusUpdate(property.id, e.target.value)}
                          disabled={updatingStatus === property.id}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          <option value="FREE">Available</option>
                          <option value="SOLD">Sold</option>
                          <option value="BOOKED">Booked</option>
                        </select>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewProperty(property)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View Property"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Edit Property"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            disabled={deletingProperty === property.id}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Delete Property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Loading States */}
                        {updatingStatus === property.id && (
                          <div className="text-xs text-blue-600">Updating...</div>
                        )}
                        {deletingProperty === property.id && (
                          <div className="text-xs text-red-600">Deleting...</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh Data
          </button>
        </div>

        {/* Property Edit Modal */}
        <PropertyEditModal
          property={selectedProperty}
          isOpen={showPropertyModal}
          onClose={() => {
            setShowPropertyModal(false)
            setSelectedProperty(null)
          }}
          onUpdate={fetchData}
        />
      </div>
    </>
  )
}

export default PropertyManagement
