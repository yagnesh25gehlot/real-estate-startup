import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { propertiesApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

interface PropertyFiltersProps {
  filters: {
    type: string
    location: string
    minPrice: string
    maxPrice: string
    status: string
  }
  onFiltersChange: (filters: any) => void
}

const PropertyFilters = ({ filters, onFiltersChange }: PropertyFiltersProps) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  
  const [typesData, setTypesData] = useState<any>(null)
  const [locationsData, setLocationsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('Fetching property types and locations...')
        
        const [typesResponse, locationsResponse] = await Promise.all([
          propertiesApi.getTypes(),
          propertiesApi.getLocations()
        ])
        
        console.log('Types response:', typesResponse.data)
        console.log('Locations response:', locationsResponse.data)
        
        setTypesData(typesResponse.data.data) // Fix: access response.data.data
        setLocationsData(locationsResponse.data.data) // Fix: access response.data.data
      } catch (error) {
        console.error('Failed to fetch filter data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const types = typesData || []
  const locations = locationsData || []

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading filters...</p>
        </div>
      </div>
    )
  }

  const clearFilters = () => {
    onFiltersChange({
      type: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      status: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Property Type */}
        <div className="form-group">
          <label className="label">Property Type</label>
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
            className="input"
          >
            <option value="">All Types</option>
            {types.map((type: string) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="label">Location</label>
          <select
            value={filters.location}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            className="input"
          >
            <option value="">All Locations</option>
            {locations.map((location: string) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div className="form-group">
          <label className="label">Min Price (₹)</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={filters.minPrice}
            onChange={(e) => {
              const newFilters = { ...filters, minPrice: e.target.value }
              onFiltersChange(newFilters)
            }}
            className="input text-gray-900"
          />
        </div>

        {/* Max Price */}
        <div className="form-group">
          <label className="label">Max Price (₹)</label>
          <input
            type="number"
            placeholder="Any"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => {
              const newFilters = { ...filters, maxPrice: e.target.value }
              onFiltersChange(newFilters)
            }}
            className="input text-gray-900"
          />
        </div>

        {/* Status - Only show all status options for admin */}
        {isAdmin && (
          <div className="form-group">
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">All Status</option>
              <option value="FREE">Available</option>
              <option value="BOOKED">Booked</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, type: 'HOUSE' })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.type === 'HOUSE' 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Houses
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, type: 'APARTMENT' })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.type === 'APARTMENT' 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Apartments
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, type: 'COMMERCIAL' })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.type === 'COMMERCIAL' 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Commercial
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, status: 'FREE' })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.status === 'FREE' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, minPrice: '500000', maxPrice: '1000000' })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.minPrice === '500000' && filters.maxPrice === '1000000'
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            ₹5L - ₹10L
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, minPrice: '1000000' })}
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.minPrice === '1000000'
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            ₹10L+
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyFilters 